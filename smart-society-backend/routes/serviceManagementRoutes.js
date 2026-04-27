import express from "express";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceManagementController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==============================
// PUBLIC: Get all services
// ==============================
router.get("/", getAllServices);

// ==============================
// ADMIN ONLY
// ==============================
router.post("/", protect, isAdmin, createService);
router.put("/:id", protect, isAdmin, updateService);
router.delete("/:id", protect, isAdmin, deleteService);

export default router;