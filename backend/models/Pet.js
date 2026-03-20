const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pet name is required"],
      trim: true,
    },
    species: {
      type: String,
      required: [true, "Species is required"],
      enum: ["dog", "cat", "bird", "rabbit", "fish", "reptile", "other"],
    },
    breed: {
      type: String,
      required: [true, "Breed is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    photo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
    },
    vaccinated: {
      type: Boolean,
      default: false,
    },
    neutered: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Text index for search
petSchema.index({ name: "text", breed: "text" });

module.exports = mongoose.model("Pet", petSchema);