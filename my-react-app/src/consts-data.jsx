// The backend's base URL. Set VITE_API_URL in .env.local (see .env.example) to
// point at a local Django server or at your own deployment (e.g. on Render).
const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export const DEV_API_URL = `${API_URL}/games`;
export const DEV_API_GROUPSURL = `${API_URL}/groups`;
export const DEV_API_AUTH = `${API_URL}/auth`;
