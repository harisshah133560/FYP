import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    // 🔹 Service Reference
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },

    // 👤 Resident
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👷 Worker
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔄 STATUS FLOW
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in-progress",
        "otp-sent",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },

    // 🔐 OTP SYSTEM
    otp: {
      type: String,
      default: null,
      select: false,
    },

    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // ==============================
    // 💳 PAYMENT SYSTEM
    // ==============================

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "verified", "rejected"],
      default: "unpaid",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "easypaisa", "jazzcash"],
      default: null,
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    paymentProof: {
      type: String, // (optional: for future image upload)
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    paymentRejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    // ==============================
    // 💰 EARNINGS
    // ==============================

    adminEarning: {
      type: Number,
      default: 0,
      min: [0, "Invalid amount"],
    },

    workerEarning: {
      type: Number,
      default: 0,
      min: [0, "Invalid amount"],
    },

    // ==============================
    // ⭐ RATING SYSTEM
    // ==============================

    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: null,
    },

    review: {
      type: String,
      trim: true,
      maxlength: [500, "Review too long"],
      default: "",
    },

    ratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

//
// 🚀 INDEXES
//
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ resident: 1 });
serviceRequestSchema.index({ assignedWorker: 1 });
serviceRequestSchema.index({ service: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ status: 1, createdAt: -1 });
serviceRequestSchema.index({ assignedWorker: 1, rating: -1 });
serviceRequestSchema.index({ resident: 1, createdAt: -1 });
serviceRequestSchema.index({ assignedWorker: 1, status: 1 });

// Payment indexes
serviceRequestSchema.index({ paymentStatus: 1 });
serviceRequestSchema.index({ isPaid: 1 });
serviceRequestSchema.index({ paidAt: -1 });

//
// 🔥 MIDDLEWARE (SAFE LOGIC)
//
serviceRequestSchema.pre("save", function () {
  // Clear OTP when job ends
  if (this.status === "completed" || this.status === "cancelled") {
    this.otp = null;
    this.otpExpires = null;
  }

  // Only run payment logic when paymentStatus changes
  if (this.isModified("paymentStatus")) {
    if (this.paymentStatus !== "verified") {
      this.isPaid = false;
      this.adminEarning = 0;
      this.workerEarning = 0;
    }

    if (this.paymentStatus === "verified" && this.price >= 0) {
      this.isPaid = true;
      this.adminEarning = Number(this.price || 0) * 0.2;
      this.workerEarning = Number(this.price || 0) * 0.8;
    }
  }
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;