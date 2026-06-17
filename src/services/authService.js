import axios from "axios";
import { API_BASE } from "./api";

// Separate instance with no interceptors — auth endpoints are always public
const authAxios = axios.create({ baseURL: API_BASE });

export const authService = {
  register: (data) =>
    authAxios.post("/auth/register", data).then((r) => r.data),

  confirm: (data) =>
    authAxios.post("/auth/confirm", data).then((r) => r.data),

  login: (data) =>
    authAxios.post("/auth/login", data).then((r) => r.data),

  refresh: (data) =>
    authAxios.post("/auth/refresh", data).then((r) => r.data),

  forgotPassword: (data) =>
    authAxios.post("/auth/forgot-password", data).then((r) => r.data),

  resetPassword: (data) =>
    authAxios.post("/auth/reset-password", data).then((r) => r.data),

  logout: (accessToken) =>
    authAxios
      .post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((r) => r.data),
};
