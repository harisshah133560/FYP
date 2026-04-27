import User from "../models/User.js";
import ServiceRequest from "../models/ServiceRequest.js";

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const [
      totalUsers,
      totalWorkers,
      totalRequests,
      completedRequests,
      pendingRequests,
      inProgressRequests,
      assignedRequests,
      cancelledRequests,
    ] = await Promise.all([
      User.countDocuments({ role: "resident" }),
      User.countDocuments({ role: "worker" }),
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: "completed" }),
      ServiceRequest.countDocuments({ status: "pending" }),
      ServiceRequest.countDocuments({ status: "in-progress" }),
      ServiceRequest.countDocuments({ status: "assigned" }),
      ServiceRequest.countDocuments({ status: "cancelled" }),
    ]);

    res.status(200).json({
      totalUsers,
      totalWorkers,
      totalRequests,
      completedRequests,
      pendingRequests,
      inProgressRequests,
      assignedRequests,
      cancelledRequests,
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};