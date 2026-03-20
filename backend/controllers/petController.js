const asyncHandler = require("express-async-handler");
const Pet = require("../models/Pet");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get all available pets (public) with search, filter, pagination
// @route   GET /api/pets
// @access  Public
const getPets = asyncHandler(async (req, res) => {
  const {
    search,
    species,
    breed,
    minAge,
    maxAge,
    status,
    page = 1,
    limit = 9,
  } = req.query;

  const query = {};

  // Only show available pets to public; admin can see all via /admin/pets
  if (!status) {
    query.status = "available";
  } else {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { breed: { $regex: search, $options: "i" } },
    ];
  }

  if (species) query.species = species;
  if (breed) query.breed = { $regex: breed, $options: "i" };
  if (minAge || maxAge) {
    query.age = {};
    if (minAge) query.age.$gte = Number(minAge);
    if (maxAge) query.age.$lte = Number(maxAge);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Pet.countDocuments(query);
  const pets = await Pet.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: pets,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Public
const getPetById = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate("addedBy", "name email");
  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }
  res.json({ success: true, data: pet });
});

// @desc    Create a pet
// @route   POST /api/pets
// @access  Admin
const createPet = asyncHandler(async (req, res) => {
  const { name, species, breed, age, gender, description, vaccinated, neutered } = req.body;

  const petData = {
    name,
    species,
    breed,
    age,
    gender,
    description,
    vaccinated,
    neutered,
    addedBy: req.user._id,
  };

  if (req.file) {
    petData.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const pet = await Pet.create(petData);
  res.status(201).json({ success: true, data: pet });
});

// @desc    Update a pet
// @route   PUT /api/pets/:id
// @access  Admin
const updatePet = asyncHandler(async (req, res) => {
  let pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  // If a new photo is uploaded, delete old one from cloudinary
  if (req.file && pet.photo.publicId) {
    await cloudinary.uploader.destroy(pet.photo.publicId);
  }

  const updateData = { ...req.body };
  if (req.file) {
    updateData.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  pet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: pet });
});

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Admin
const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  if (pet.photo.publicId) {
    await cloudinary.uploader.destroy(pet.photo.publicId);
  }

  await pet.deleteOne();
  res.json({ success: true, message: "Pet deleted successfully" });
});

// @desc    Get all pets (admin — all statuses)
// @route   GET /api/pets/admin/all
// @access  Admin
const getAllPetsAdmin = asyncHandler(async (req, res) => {
  const { search, species, status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { breed: { $regex: search, $options: "i" } },
    ];
  }
  if (species) query.species = species;
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Pet.countDocuments(query);
  const pets = await Pet.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("addedBy", "name");

  res.json({
    success: true,
    data: pets,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

module.exports = { getPets, getPetById, createPet, updatePet, deletePet, getAllPetsAdmin };