import express from "express";
import {
  createRequest,
  getAllRequests,
  assignWorker,
  updateStatus,
  getMyAssignedRequests,
  getMyRequests,
  deleteRequest,
  editRequest,
  cancelRequest,
  getMonthlyStats,
  requestCompletion,
  verifyOtp,
  makePayment,
  addRating,
  getWorkerRatings,
  getPaymentReport,
} from "../controllers/serviceController.js";

import {
  protect,
  isAdmin,
  isWorker,
  isResident,
} from "../middleware/authMiddleware.js";

const router = express.Router();

//
// 🔹 RESIDENT ROUTES
//
router.post("/", protect, isResident, createRequest);
router.get("/my", protect, isResident, getMyRequests);
router.put("/:id", protect, isResident, editRequest);
router.delete("/:id/cancel", protect, isResident, cancelRequest);
router.post("/:id/pay", protect, isResident, makePayment);
router.post("/:id/rate", protect, isResident, addRating);

//
// 🔹 WORKER ROUTES
//
router.get("/worker", protect, isWorker, getMyAssignedRequests);
router.put("/:id/status", protect, isWorker, updateStatus);
router.post("/:id/request-completion", protect, isWorker, requestCompletion);
router.post("/:id/verify-otp", protect, isWorker, verifyOtp);

//
// 🔹 ADMIN ROUTES
//
router.get("/dashboard/monthly", protect, isAdmin, getMonthlyStats);
router.get("/dashboard/worker-ratings", protect, isAdmin, getWorkerRatings);
router.get("/", protect, isAdmin, getAllRequests);
router.put("/:id/assign", protect, isAdmin, assignWorker);
router.delete("/:id/delete", protect, isAdmin, deleteRequest);
router.get("/payments/report", protect, isAdmin, getPaymentReport);

export default router;