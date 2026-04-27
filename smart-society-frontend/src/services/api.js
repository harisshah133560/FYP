import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================
API.interceptors.request.use(
  (req) => {
    try {
      const userInfo = localStorage.getItem("userInfo");

      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        const token = parsedUser?.token;

        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Token parse error:", error);
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized - logging out");

      localStorage.removeItem("userInfo");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default API;