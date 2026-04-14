import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";


/* ---------------- AXIOS INSTANCE ---------------- */
const api = axios.create({
  baseURL: "https://electiontrackwebsitebackend.onrender.com/",
});


/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);


/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 🔒 Token invalid / expired
      localStorage.removeItem("token");

      // redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;