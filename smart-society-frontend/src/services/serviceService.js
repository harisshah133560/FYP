import API from "./api";

/* =========================
   RESIDENT APIs
========================= */

export const createRequest = (data) => {
  return API.post("/requests", data);
};

export const getMyRequests = () => {
  return API.get("/requests/my");
};

export const editRequest = (id, data) => {
  return API.put(`/requests/${id}`, data);
};

export const cancelRequest = (id) => {
  return API.delete(`/requests/${id}/cancel`);
};

/* =========================
   ADMIN APIs
========================= */

export const getAllRequests = () => {
  return API.get("/requests");
};

export const deleteRequest = (id) => {
  return API.delete(`/requests/${id}/delete`);
};

export const assignWorker = (id, workerId) => {
  return API.put(`/requests/${id}/assign`, { workerId });
};

/* =========================
   WORKER APIs
========================= */

export const getWorkerRequests = () => {
  return API.get("/requests/worker");
};

export const updateStatus = (id, status) => {
  return API.put(`/requests/${id}/status`, { status });
};

export const requestCompletion = (id) => {
  return API.post(`/requests/${id}/request-completion`);
};

export const verifyOtp = (id, otp) => {
  return API.post(`/requests/${id}/verify-otp`, { otp });
};

/* =========================
   PAYMENT
========================= */

export const makePayment = (id, paymentMethod) => {
  return API.post(`/requests/${id}/pay`, { method: paymentMethod });
};

/* =========================
   RATING
========================= */

export const addRating = (id, rating, review) => {
  return API.post(`/requests/${id}/rate`, { rating, review });
};

/* =========================
   DASHBOARD / REPORTS
========================= */

export const getDashboardStats = () => {
  return API.get("/admin/dashboard-stats");
};

export const getMonthlyStats = () => {
  return API.get("/requests/dashboard/monthly");
};

export const getWorkerRatings = () => {
  return API.get("/requests/dashboard/worker-ratings");
};