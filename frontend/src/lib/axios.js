import axios from "axios";

// This instance is wired up and ready for the real Swing API.
// Until the backend exists, src/lib/mockApi.js stands in for it so the
// whole app can be built and demoed against realistic, persisted data.
// Swap a mockApi.* call for http.get/post/patch of the same shape and
// everything above the service layer keeps working unchanged.
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("swing_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
