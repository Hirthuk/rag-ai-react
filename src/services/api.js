import axios from "axios";

export const API_BASE = "http://localhost:8080";

// Axios instance used by all protected API calls (chat, upload, etc.)
export const api = axios.create({ baseURL: API_BASE });

// Auth-only instance — no interceptors to avoid infinite retry loops
const authAxios = axios.create({ baseURL: API_BASE });

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: try token refresh once, then force logout
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      const email = localStorage.getItem("userEmail");
      if (refreshToken && email) {
        try {
          const { data } = await authAxios.post("/auth/refresh", { refreshToken, email });
          localStorage.setItem("accessToken", data.accessToken);
          if (data.idToken) localStorage.setItem("idToken", data.idToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          clearTokens();
          window.location.href = "/login";
        }
      } else {
        clearTokens();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const clearTokens = () => {
  ["accessToken", "idToken", "refreshToken", "userEmail"].forEach((k) =>
    localStorage.removeItem(k)
  );
};
