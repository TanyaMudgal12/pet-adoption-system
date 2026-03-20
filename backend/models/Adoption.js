const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
      required: [true, "Please provide a reason for adoption"],
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    livingCondition: {
      type: String,
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
adoptionSchema.index({ pet: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Adoption", adoptionSchema);