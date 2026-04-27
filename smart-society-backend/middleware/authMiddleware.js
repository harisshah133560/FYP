import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==============================
// HELPER: GET TOKEN FROM HEADER
// ==============================
const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// ==============================
// OPTIONAL AUTH (Public routes)
// ==============================
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
    }

    return next();
  } catch (error) {
    console.error("Optional Auth Error:", error.message);
    return next();
  }
};

// ==============================
// PROTECT ROUTES (STRICT)
// ==============================
export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({
      message: "Token invalid or expired",
    });
  }
};

// ==============================
// ADMIN ONLY
// ==============================
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied, admin only",
  });
};

// ==============================
// WORKER ONLY
// ==============================
export const isWorker = (req, res, next) => {
  if (req.user && req.user.role === "worker") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied, worker only",
  });
};

// ==============================
// RESIDENT ONLY
// ==============================
export const isResident = (req, res, next) => {
  if (req.user && req.user.role === "resident") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied, residents only",
  });
};