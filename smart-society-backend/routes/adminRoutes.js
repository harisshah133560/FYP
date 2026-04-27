import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin dashboard welcome
router.get("/dashboard", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin Dashboard 🎯" });
});

// ✅ Dashboard statistics
router.get("/dashboard-stats", protect, isAdmin, getDashboardStats);

export default router;