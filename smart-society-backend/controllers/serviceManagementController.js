import Service from "../models/Service.js";
import ServiceRequest from "../models/ServiceRequest.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// ==============================
// GET ALL SERVICES
// ==============================
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ==============================
// CREATE SERVICE
// ==============================
export const createService = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    let { serviceType, category, subcategory, price } = req.body;

    serviceType = serviceType?.trim();
    category = category?.trim();
    subcategory = subcategory?.trim();
    price = Number(price);

    if (!serviceType || !category || !subcategory || Number.isNaN(price)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price must be positive" });
    }

    const existing = await Service.findOne({
      serviceType,
      category,
      subcategory,
    });

    if (existing) {
      return res.status(400).json({
        message: "This service already exists",
      });
    }

    const service = await Service.create({
      serviceType,
      category,
      subcategory,
      price,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// UPDATE SERVICE
// ==============================
export const updateService = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const nextServiceType = req.body.serviceType?.trim() || service.serviceType;
    const nextCategory = req.body.category?.trim() || service.category;
    const nextSubcategory =
      req.body.subcategory?.trim() || service.subcategory;

    let nextPrice = service.price;
    if (req.body.price !== undefined) {
      const parsedPrice = Number(req.body.price);

      if (Number.isNaN(parsedPrice)) {
        return res.status(400).json({ message: "Invalid price" });
      }

      if (parsedPrice < 0) {
        return res.status(400).json({ message: "Price must be positive" });
      }

      nextPrice = parsedPrice;
    }

    const duplicate = await Service.findOne({
      _id: { $ne: id },
      serviceType: nextServiceType,
      category: nextCategory,
      subcategory: nextSubcategory,
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Another service with same type, category and subcategory already exists",
      });
    }

    service.serviceType = nextServiceType;
    service.category = nextCategory;
    service.subcategory = nextSubcategory;
    service.price = nextPrice;

    const updated = await service.save();

    res.json({
      message: "Service updated successfully",
      service: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// DELETE SERVICE
// ==============================
export const deleteService = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const requestUsingService = await ServiceRequest.exists({ service: id });
    if (requestUsingService) {
      return res.status(400).json({
        message: "Cannot delete service because it is used in service requests",
      });
    }

    const workerUsingService = await User.exists({
      role: "worker",
      services: id,
    });

    if (workerUsingService) {
      return res.status(400).json({
        message: "Cannot delete service because it is assigned to workers",
      });
    }

    await service.deleteOne();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};