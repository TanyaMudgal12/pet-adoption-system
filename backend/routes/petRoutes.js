const express = require("express");
const router = express.Router();
const {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getAllPetsAdmin,
} = require("../controllers/petController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

/**
 * @swagger
 * tags:
 *   name: Pets
 *   description: Pet management endpoints
 */

/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Get all available pets (public) with search, filter, pagination
 *     tags: [Pets]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or breed
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *           enum: [dog, cat, bird, rabbit, fish, reptile, other]
 *       - in: query
 *         name: breed
 *         schema:
 *           type: string
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 9
 *     responses:
 *       200:
 *         description: List of pets with pagination info
 */
router.get("/", getPets);

/**
 * @swagger
 * /pets/admin/all:
 *   get:
 *     summary: Get all pets (admin, all statuses)
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: All pets with pagination
 */
router.get("/admin/all", protect, adminOnly, getAllPetsAdmin);

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Get a single pet by ID
 *     tags: [Pets]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet details
 *       404:
 *         description: Pet not found
 */
router.get("/:id", getPetById);

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Create a new pet (admin)
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, species, breed, age, gender]
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               description:
 *                 type: string
 *               vaccinated:
 *                 type: boolean
 *               neutered:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Pet created
 */
router.post("/", protect, adminOnly, upload.single("photo"), createPet);

/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Update a pet (admin)
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet updated
 *   delete:
 *     summary: Delete a pet (admin)
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet deleted
 */
router.put("/:id", protect, adminOnly, upload.single("photo"), updatePet);
router.delete("/:id", protect, adminOnly, deletePet);

module.exports = router;