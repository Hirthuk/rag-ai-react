import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { clearTokens } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEYS = {
  access: "accessToken",
  id: "idToken",
  refresh: "refreshToken",
  email: "userEmail",
};

const saveTokens = (data, email) => {
  if (data.accessToken) localStorage.setItem(TOKEN_KEYS.access, data.accessToken);
  if (data.idToken) localStorage.setItem(TOKEN_KEYS.id, data.idToken);
  if (data.refreshToken) localStorage.setItem(TOKEN_KEYS.refresh, data.refreshToken);
  if (email) localStorage.setItem(TOKEN_KEYS.email, email);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEYS.access);
    const email = localStorage.getItem(TOKEN_KEYS.email);
    if (token && email) setUser({ email });
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    saveTokens(data, email);
    setUser({ email });
    return data;
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEYS.access);
    try {
      if (token) await authService.logout(token);
    } catch {
      // proceed with local logout even if the API call fails
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        saveTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
