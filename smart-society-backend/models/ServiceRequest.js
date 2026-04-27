import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
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

    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

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

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "easypaisa", "jazzcash", null],
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

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

serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ resident: 1 });
serviceRequestSchema.index({ assignedWorker: 1 });
serviceRequestSchema.index({ service: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ status: 1, createdAt: -1 });
serviceRequestSchema.index({ assignedWorker: 1, rating: -1 });
serviceRequestSchema.index({ resident: 1, createdAt: -1 });
serviceRequestSchema.index({ assignedWorker: 1, status: 1 });

serviceRequestSchema.pre("save", function () {
  if (this.status === "completed" && this.price >= 0) {
    this.adminEarning = Number(this.price) * 0.2;
    this.workerEarning = Number(this.price) * 0.8;
  }

  if (this.status === "completed" || this.status === "cancelled") {
    this.otp = null;
    this.otpExpires = null;
  }
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;