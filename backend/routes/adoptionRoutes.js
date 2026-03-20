const express = require("express");
const router = express.Router();
const {
  applyForAdoption,
  getMyAdoptions,
  getAllAdoptions,
  getAdoptionById,
  reviewAdoption,
  deleteAdoption,
} = require("../controllers/adoptionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Adoptions
 *   description: Adoption application endpoints
 */

/**
 * @swagger
 * /adoptions:
 *   post:
 *     summary: Apply to adopt a pet
 *     tags: [Adoptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [petId, reason]
 *             properties:
 *               petId:
 *                 type: string
 *               reason:
 *                 type: string
 *               experience:
 *                 type: string
 *               livingCondition:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Pet not available or already applied
 */
router.post("/", protect, applyForAdoption);

/**
 * @swagger
 * /adoptions/my:
 *   get:
 *     summary: Get current user's adoption applications
 *     tags: [Adoptions]
 *     responses:
 *       200:
 *         description: List of user's applications
 */
router.get("/my", protect, getMyAdoptions);

/**
 * @swagger
 * /adoptions:
 *   get:
 *     summary: Get all adoption applications (admin)
 *     tags: [Adoptions]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All applications
 */
router.get("/", protect, adminOnly, getAllAdoptions);

/**
 * @swagger
 * /adoptions/{id}:
 *   get:
 *     summary: Get single adoption application
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Adoption application details
 *   delete:
 *     summary: Withdraw adoption application (applicant only, while pending)
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application withdrawn
 */
router.get("/:id", protect, getAdoptionById);
router.delete("/:id", protect, deleteAdoption);

/**
 * @swagger
 * /adoptions/{id}/review:
 *   put:
 *     summary: Approve or reject an adoption application (admin)
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application reviewed
 */
router.put("/:id/review", protect, adminOnly, reviewAdoption);

module.exports = router;