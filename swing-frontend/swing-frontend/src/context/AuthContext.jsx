import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "../lib/mockApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getSessionUser());
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    setUser(api.getSessionUser());
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedIn = await api.login(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(api.getSessionUser());
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
