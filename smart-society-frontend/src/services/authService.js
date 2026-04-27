import API from "./api";

/* =========================
   AUTH APIs
========================= */

// LOGIN
export const loginUser = (data) => {
  return API.post("/users/login", data);
};

// REGISTER (Resident)
export const registerUser = (data) => {
  return API.post("/users/register", data);
};

/* =========================
   ADMIN USER MANAGEMENT
========================= */

// CREATE WORKER
export const createWorker = (data) => {
  return API.post("/users/workers", data);
};

// GET ALL USERS
export const getUsers = () => {
  return API.get("/users");
};

// GET ALL WORKERS
export const getWorkers = () => {
  return API.get("/users/workers");
};

// GET ALL RESIDENTS
export const getResidents = () => {
  return API.get("/users/residents");
};

// DELETE USER
export const deleteUser = (id) => {
  return API.delete(`/users/${id}`);
};

/* =========================
   WORKER SERVICE ASSIGNMENT
========================= */

// ASSIGN SERVICES TO WORKER
export const assignServicesToWorker = (workerId, services) => {
  return API.put(`/users/workers/${workerId}/services`, { services });
};