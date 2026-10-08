import axios from "axios";

// One axios instance for the whole app. The token is read on every request, so
// login and logout take effect immediately and no component has to manage the
// Authorization header itself.
const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// An expired or invalid token would otherwise leave the UI "logged in" while
// every request fails. Drop it so the app falls back to the logged-out state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (
      error.response?.status === 401 &&
      localStorage.getItem("token") &&
      (detail === "Invalid Token" || detail === "User Not Found")
    ) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-change"));
    }
    return Promise.reject(error);
  }
);

// Pull a readable message out of whatever shape the backend (or the network) returned.
export const getErrorMessage = (
  err,
  fallback = "Something went wrong. Please try again."
) => {
  const data = err.response?.data;
  if (!data) return "Could not reach the server. Please try again in a moment.";
  if (typeof data === "string") return fallback;
  if (typeof data.error === "string") return data.error;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  const messages = Object.values(data)
    .flat()
    .filter((m) => typeof m === "string");
  return messages.length ? messages.join(" ") : fallback;
};

export default api;
