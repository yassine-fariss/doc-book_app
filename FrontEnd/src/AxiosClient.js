import axios from "axios";
import { get } from "./Services/LocalStorageService";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api",
});

axiosClient.interceptors.request.use((config) => {
  config.headers.Accept = "application/json";

  let token = null;
  const url = config.url || "";

  if (url.startsWith("/doctor")) {
    token = get("TOKEN_DOCTOR");
  } else if (url.startsWith("/admin")) {
    token = get("TOKEN_ADMIN");
  } else if (url.startsWith("/user")) {
    token = get("TOKEN_USER");
  } else {
    token = get("TOKEN_USER") || get("TOKEN_DOCTOR") || get("TOKEN_ADMIN");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
