import User from "../models/User.js";
import Service from "../models/Service.js";
import jwt from "jsonwebtoken";

// 🔑 Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ==============================
// 🧑 REGISTER RESIDENT
// ==============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "resident",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      services: user.services || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 🔐 LOGIN (ALL ROLES)
// ==============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).populate(
      "services",
      "serviceType category subcategory price"
    );

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      services: user.services || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 🛠 CREATE WORKER (ADMIN)
// ==============================
export const createWorker = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { name, email, password, services } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    let validatedServices = [];

    if (Array.isArray(services) && services.length > 0) {
      const foundServices = await Service.find({
        _id: { $in: services },
      }).select("_id");

      if (foundServices.length !== services.length) {
        return res.status(400).json({
          message: "One or more selected services are invalid",
        });
      }

      validatedServices = services;
    }

    const worker = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "worker",
      services: validatedServices,
    });

    const populatedWorker = await User.findById(worker._id).populate(
      "services",
      "serviceType category subcategory price"
    );

    res.status(201).json({
      message: "Worker created successfully",
      worker: populatedWorker,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};