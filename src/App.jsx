import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        Checking session...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/*"
        element={
          isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}