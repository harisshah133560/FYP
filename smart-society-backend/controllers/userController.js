import User from "../models/User.js";
import Service from "../models/Service.js";
import ServiceRequest from "../models/ServiceRequest.js";
import mongoose from "mongoose";

// ==============================
// GET ALL USERS
// ==============================
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const users = await User.find()
      .select("-password")
      .populate("services", "serviceType category subcategory price")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ==============================
// GET WORKERS
// ==============================
export const getWorkers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const workers = await User.find({ role: "worker" })
      .select("-password")
      .populate({
        path: "services",
        select: "serviceType category subcategory price",
      })
      .sort({ createdAt: -1 });

    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ==============================
// GET RESIDENTS
// ==============================
export const getResidents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const residents = await User.find({ role: "resident" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ==============================
// ASSIGN SERVICES TO WORKER
// ==============================
export const assignServicesToWorker = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { services } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid worker ID" });
    }

    if (!Array.isArray(services)) {
      return res.status(400).json({
        message: "Services must be an array",
      });
    }

    const worker = await User.findById(id);

    if (!worker || worker.role !== "worker") {
      return res.status(404).json({ message: "Worker not found" });
    }

    if (services.length > 0) {
      const validServices = await Service.find({
        _id: { $in: services },
      }).select("_id");

      if (validServices.length !== services.length) {
        return res.status(400).json({
          message: "One or more selected services are invalid",
        });
      }
    }

    worker.services = services;
    await worker.save();

    const updatedWorker = await User.findById(worker._id)
      .select("-password")
      .populate("services", "serviceType category subcategory price");

    res.json({
      message: "Services assigned successfully",
      worker: updatedWorker,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// DELETE USER
// ==============================
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    if (user.role === "resident") {
      const residentRequests = await ServiceRequest.exists({
        resident: user._id,
      });

      if (residentRequests) {
        return res.status(400).json({
          message: "Cannot delete resident because service requests exist for this user",
        });
      }
    }

    if (user.role === "worker") {
      const workerRequests = await ServiceRequest.exists({
        assignedWorker: user._id,
      });

      if (workerRequests) {
        return res.status(400).json({
          message: "Cannot delete worker because requests are assigned to this worker",
        });
      }
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};