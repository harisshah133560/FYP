import ServiceRequest from "../models/ServiceRequest.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import sendEmail from "../utils/sendEmail.js";

// ==============================
// CREATE REQUEST (RESIDENT)
// ==============================
export const createRequest = async (req, res) => {
  try {
    if (req.user.role !== "resident") {
      return res.status(403).json({ message: "Only residents allowed" });
    }

    const { serviceId, title, description, price } = req.body;

    if (!serviceId || !title || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const request = await ServiceRequest.create({
      service: serviceId,
      title: title.trim(),
      description: description.trim(),
      price: price ?? service.price ?? 0,
      resident: req.user._id,
      status: "pending",
    });

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("service", "serviceType category subcategory price")
      .populate("resident", "name email");

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// EDIT REQUEST (RESIDENT)
// ==============================
export const editRequest = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Cannot edit after assignment",
      });
    }

    if (title) request.title = title.trim();
    if (description) request.description = description.trim();
    if (price !== undefined) request.price = price;

    await request.save();

    const updatedRequest = await ServiceRequest.findById(request._id)
      .populate("service", "serviceType category subcategory price")
      .populate("resident", "name email")
      .populate("assignedWorker", "name email");

    res.json({ message: "Request updated", request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// GET ALL REQUESTS (ADMIN)
// ==============================
export const getAllRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const requests = await ServiceRequest.find()
      .populate("resident", "name email")
      .populate("assignedWorker", "name email")
      .populate("service", "serviceType category subcategory price")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// ASSIGN WORKER (ADMIN)
// ==============================
export const assignWorker = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID is required" });
    }

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(404).json({ message: "Invalid worker" });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be assigned" });
    }

    const hasMatchingService = worker.services.some(
      (serviceId) => serviceId.toString() === request.service.toString()
    );

    if (!hasMatchingService) {
      return res.status(400).json({
        message: "Worker does not have the required service",
      });
    }

    request.assignedWorker = workerId;
    request.status = "assigned";

    await request.save();

    const updatedRequest = await ServiceRequest.findById(request._id)
      .populate("resident", "name email")
      .populate("assignedWorker", "name email")
      .populate("service", "serviceType category subcategory price");

    res.json({ message: "Worker assigned successfully", request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// UPDATE STATUS (WORKER)
// ==============================
export const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Worker only" });
    }

    const { status } = req.body;

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    if (!request.assignedWorker) {
      return res.status(400).json({ message: "No worker assigned" });
    }

    if (request.assignedWorker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const validTransitions = {
      assigned: ["in-progress"],
      "in-progress": [],
      "otp-sent": [],
      completed: [],
      pending: [],
      cancelled: [],
    };

    if (!validTransitions[request.status]) {
      return res.status(400).json({ message: "Invalid current request status" });
    }

    if (!validTransitions[request.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${request.status} to ${status}`,
      });
    }

    request.status = status;
    await request.save();

    const updatedRequest = await ServiceRequest.findById(request._id)
      .populate("service", "serviceType category subcategory price")
      .populate("resident", "name email")
      .populate("assignedWorker", "name email");

    res.json({ message: "Status updated", request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// WORKER JOBS
// ==============================
export const getMyAssignedRequests = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Worker only" });
    }

    const requests = await ServiceRequest.find({
      assignedWorker: req.user._id,
    })
      .populate("service", "serviceType category subcategory price")
      .populate("resident", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// RESIDENT REQUESTS
// ==============================
export const getMyRequests = async (req, res) => {
  try {
    if (req.user.role !== "resident") {
      return res.status(403).json({ message: "Resident only" });
    }

    const requests = await ServiceRequest.find({
      resident: req.user._id,
    })
      .populate("service", "serviceType category subcategory price")
      .populate("assignedWorker", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// DELETE REQUEST (ADMIN)
// ==============================
export const deleteRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    await request.deleteOne();

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// CANCEL REQUEST (RESIDENT)
// ==============================
export const cancelRequest = async (req, res) => {
  try {
    if (req.user.role !== "resident") {
      return res.status(403).json({ message: "Resident only" });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    if (request.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Cannot cancel after assignment",
      });
    }

    request.status = "cancelled";
    await request.save();

    res.json({ message: "Request cancelled successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// OTP SEND
// ==============================
export const requestCompletion = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Worker only" });
    }

    const request = await ServiceRequest.findById(req.params.id).populate(
      "resident",
      "name email"
    );

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    if (!request.assignedWorker) {
      return res.status(400).json({ message: "No worker assigned" });
    }

    if (request.assignedWorker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "in-progress") {
      return res.status(400).json({ message: "Start job first" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    request.otp = otp;
    request.otpExpires = Date.now() + 5 * 60 * 1000;
    request.status = "otp-sent";

    await request.save();

    await sendEmail(
      request.resident.email,
      "Service OTP Verification",
      `Your service completion OTP is: ${otp}`
    );

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Worker only" });
    }

    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const request = await ServiceRequest.findById(req.params.id).select(
      "+otp +otpExpires"
    );

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    if (!request.assignedWorker) {
      return res.status(400).json({ message: "No worker assigned" });
    }

    if (request.assignedWorker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "otp-sent") {
      return res.status(400).json({
        message: "OTP has not been requested yet",
      });
    }

    const enteredOtp = String(otp).trim();
    const savedOtp = String(request.otp || "").trim();

    if (!savedOtp || savedOtp !== enteredOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!request.otpExpires || request.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    request.status = "completed";
    request.otp = null;
    request.otpExpires = null;
    request.adminEarning = Number(request.price || 0) * 0.2;
    request.workerEarning = Number(request.price || 0) * 0.8;

    await request.save();

    res.json({ message: "Job completed successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// PAYMENT SUBMIT BY RESIDENT
// ==============================
export const makePayment = async (req, res) => {
  try {
    if (req.user.role !== "resident") {
      return res.status(403).json({ message: "Resident only" });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({ message: "Complete job first" });
    }

    if (request.paymentStatus === "verified" || request.isPaid) {
      return res.status(400).json({ message: "Already paid" });
    }

    const { method, transactionId } = req.body;

    const allowedMethods = ["cash", "easypaisa", "jazzcash"];

    if (!method || !allowedMethods.includes(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if ((method === "easypaisa" || method === "jazzcash") && !transactionId) {
      return res.status(400).json({
        message: "Transaction ID is required for online payment",
      });
    }

    request.paymentMethod = method;
    request.transactionId = transactionId ? transactionId.trim() : "";
    request.paymentStatus = "pending";
    request.isPaid = false;
    request.paidAt = Date.now();
    request.verifiedAt = null;
    request.rejectedAt = null;
    request.paymentRejectionReason = "";

    await request.save();

    res.json({
      message: "Payment submitted for admin verification",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// ADMIN PAYMENT REPORT
// ==============================
export const getPaymentReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const requests = await ServiceRequest.find({
      paymentStatus: { $in: ["pending", "verified", "rejected"] },
    })
      .populate("resident", "name email")
      .populate("assignedWorker", "name email")
      .populate("service", "serviceType category subcategory price")
      .sort({ paidAt: -1 });

    const verifiedPayments = requests.filter(
      (r) => r.paymentStatus === "verified"
    );

    const pendingPayments = requests.filter(
      (r) => r.paymentStatus === "pending"
    );

    const rejectedPayments = requests.filter(
      (r) => r.paymentStatus === "rejected"
    );

    const totalRevenue = verifiedPayments.reduce(
      (sum, r) => sum + Number(r.price || 0),
      0
    );

    const totalAdminEarning = verifiedPayments.reduce(
      (sum, r) => sum + Number(r.adminEarning || 0),
      0
    );

    const totalWorkerEarning = verifiedPayments.reduce(
      (sum, r) => sum + Number(r.workerEarning || 0),
      0
    );

    res.json({
      summary: {
        totalRevenue,
        totalAdminEarning,
        totalWorkerEarning,
        pendingCount: pendingPayments.length,
        verifiedCount: verifiedPayments.length,
        rejectedCount: rejectedPayments.length,
      },
      payments: requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ==============================
// ADMIN VERIFY PAYMENT
// ==============================
export const verifyPaymentByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Payment is not pending" });
    }

    const totalAmount = Number(request.price || 0);

    request.paymentStatus = "verified";
    request.isPaid = true;
    request.verifiedAt = Date.now();
    request.rejectedAt = null;
    request.paymentRejectionReason = "";

    request.adminEarning = totalAmount * 0.2;
    request.workerEarning = totalAmount * 0.8;

    await request.save();

    res.json({
      message: "Payment verified successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// ADMIN REJECT PAYMENT
// ==============================
export const rejectPaymentByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { reason } = req.body;

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.paymentStatus !== "pending") {
      return res.status(400).json({ message: "Payment is not pending" });
    }

    request.paymentStatus = "rejected";
    request.isPaid = false;
    request.rejectedAt = Date.now();
    request.paymentRejectionReason = reason || "Payment rejected by admin";
    request.adminEarning = 0;
    request.workerEarning = 0;

    await request.save();

    res.json({
      message: "Payment rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ==============================
// MONTHLY STATS
// ==============================
export const getMonthlyStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const stats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// ADD RATING (RESIDENT)
// ==============================
export const addRating = async (req, res) => {
  try {
    if (req.user.role !== "resident") {
      return res.status(403).json({ message: "Resident only" });
    }

    const { rating, review } = req.body;

    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({
        message: "You can only rate completed jobs",
      });
    }

    if (request.rating) {
      return res.status(400).json({
        message: "Already rated",
      });
    }

    request.rating = numericRating;
    request.review = review ? review.trim() : "";
    request.ratedAt = Date.now();

    await request.save();

    res.json({ message: "Rating submitted successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// WORKER RATING STATS (ADMIN)
// ==============================
export const getWorkerRatings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const stats = await ServiceRequest.aggregate([
      {
        $match: {
          status: "completed",
          rating: { $ne: null },
          assignedWorker: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedWorker",
          totalJobs: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "worker",
        },
      },
      {
        $unwind: "$worker",
      },
      {
        $project: {
          _id: 1,
          name: "$worker.name",
          email: "$worker.email",
          totalJobs: 1,
          avgRating: { $round: ["$avgRating", 1] },
        },
      },
      {
        $sort: { avgRating: -1 },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};