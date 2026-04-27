import express from "express";

// Auth Controller
import {
  registerUser,
  loginUser,
  createWorker,
} from "../controllers/authController.js";

// User Controller
import {
  getUsers,
  getWorkers,
  getResidents,
  deleteUser,
  assignServicesToWorker,
} from "../controllers/userController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

//
// 🔓 PUBLIC ROUTES
//
router.post("/register", registerUser);
router.post("/login", loginUser);

//
// 🔐 ADMIN ROUTES
//

// 👥 All users
router.get("/", protect, isAdmin, getUsers);

// 👷 Workers
router.get("/workers", protect, isAdmin, getWorkers);

// 🏠 Residents
router.get("/residents", protect, isAdmin, getResidents);

// 🛠 Create Worker
router.post("/workers", protect, isAdmin, createWorker);

// 🔧 Assign services to worker
router.put("/workers/:id/services", protect, isAdmin, assignServicesToWorker);

// ❌ Delete user
router.delete("/:id", protect, isAdmin, deleteUser);

export default router;