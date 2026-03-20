const asyncHandler = require("express-async-handler");
const Adoption = require("../models/Adoption");
const Pet = require("../models/Pet");
const User = require("../models/User");
const { sendAdoptionStatusEmail } = require("../utils/sendEmail");

// @desc    Apply to adopt a pet
// @route   POST /api/adoptions
// @access  Private (User)
const applyForAdoption = asyncHandler(async (req, res) => {
  const { petId, reason, experience, livingCondition } = req.body;

  if (!petId || !reason) {
    res.status(400);
    throw new Error("Pet ID and reason are required");
  }

  const pet = await Pet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  if (pet.status !== "available") {
    res.status(400);
    throw new Error("This pet is not available for adoption");
  }

  // Check if already applied
  const existing = await Adoption.findOne({ pet: petId, applicant: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error("You have already applied to adopt this pet");
  }

  const adoption = await Adoption.create({
    pet: petId,
    applicant: req.user._id,
    reason,
    experience,
    livingCondition,
  });

  // Mark pet as pending
  pet.status = "pending";
  await pet.save();

  const populated = await adoption.populate([
    { path: "pet", select: "name species breed photo" },
    { path: "applicant", select: "name email" },
  ]);

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get logged-in user's adoptions
// @route   GET /api/adoptions/my
// @access  Private (User)
const getMyAdoptions = asyncHandler(async (req, res) => {
  const adoptions = await Adoption.find({ applicant: req.user._id })
    .populate("pet", "name species breed photo status")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: adoptions });
});

// @desc    Get all adoptions (admin)
// @route   GET /api/adoptions
// @access  Admin
const getAllAdoptions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Adoption.countDocuments(query);

  const adoptions = await Adoption.find(query)
    .populate("pet", "name species breed photo")
    .populate("applicant", "name email phone")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: adoptions,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

// @desc    Get single adoption by ID
// @route   GET /api/adoptions/:id
// @access  Private
const getAdoptionById = asyncHandler(async (req, res) => {
  const adoption = await Adoption.findById(req.params.id)
    .populate("pet")
    .populate("applicant", "name email phone address")
    .populate("reviewedBy", "name");

  if (!adoption) {
    res.status(404);
    throw new Error("Adoption application not found");
  }

  // Allow only admin or the applicant
  if (
    req.user.role !== "admin" &&
    adoption.applicant._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this application");
  }

  res.json({ success: true, data: adoption });
});

// @desc    Approve or reject adoption (admin)
// @route   PUT /api/adoptions/:id/review
// @access  Admin
const reviewAdoption = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const adoption = await Adoption.findById(req.params.id)
    .populate("pet")
    .populate("applicant", "name email notifications");

  if (!adoption) {
    res.status(404);
    throw new Error("Adoption application not found");
  }

  if (adoption.status !== "pending") {
    res.status(400);
    throw new Error("This application has already been reviewed");
  }

  adoption.status = status;
  adoption.adminNote = adminNote || "";
  adoption.reviewedBy = req.user._id;
  adoption.reviewedAt = new Date();
  await adoption.save();

  // Update pet status
  const pet = await Pet.findById(adoption.pet._id);
  if (status === "approved") {
    pet.status = "adopted";
  } else {
    // Check if there are other pending applications
    const otherPending = await Adoption.findOne({
      pet: pet._id,
      status: "pending",
      _id: { $ne: adoption._id },
    });
    pet.status = otherPending ? "pending" : "available";
  }
  await pet.save();

  // In-app notification
  await User.findByIdAndUpdate(adoption.applicant._id, {
    $push: {
      notifications: {
        message: `Your adoption application for ${adoption.pet.name} has been ${status}.${adminNote ? " Note: " + adminNote : ""}`,
      },
    },
  });

  // Email notification
  try {
    await sendAdoptionStatusEmail(
      adoption.applicant.email,
      adoption.applicant.name,
      adoption.pet.name,
      status,
      adminNote
    );
  } catch (err) {
    console.error("Email notification failed:", err.message);
    // Don't fail the request if email fails
  }

  res.json({ success: true, data: adoption, message: `Application ${status} successfully` });
});

// @desc    Delete/withdraw adoption application
// @route   DELETE /api/adoptions/:id
// @access  Private (applicant only, while pending)
const deleteAdoption = asyncHandler(async (req, res) => {
  const adoption = await Adoption.findById(req.params.id);

  if (!adoption) {
    res.status(404);
    throw new Error("Adoption application not found");
  }

  if (adoption.applicant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (adoption.status !== "pending") {
    res.status(400);
    throw new Error("Cannot withdraw a reviewed application");
  }

  await adoption.deleteOne();

  // Revert pet status to available if no other pending applications
  const otherPending = await Adoption.findOne({ pet: adoption.pet, status: "pending" });
  if (!otherPending) {
    await Pet.findByIdAndUpdate(adoption.pet, { status: "available" });
  }

  res.json({ success: true, message: "Application withdrawn successfully" });
});

module.exports = {
  applyForAdoption,
  getMyAdoptions,
  getAllAdoptions,
  getAdoptionById,
  reviewAdoption,
  deleteAdoption,
};