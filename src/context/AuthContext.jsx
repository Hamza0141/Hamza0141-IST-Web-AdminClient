import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentAdmin, loginAdmin, logoutAdmin } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function checkAuth() {
    try {
      const data = await getCurrentAdmin();
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function login(credentials) {
    const data = await loginAdmin(credentials);
    setAdmin(data.admin);
    return data;
  }

  async function logout() {
    await logoutAdmin();
    setAdmin(null);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        authLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}