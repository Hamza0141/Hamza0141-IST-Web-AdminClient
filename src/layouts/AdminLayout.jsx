import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import DashboardPage from "../pages/DashboardPage";
import PrayerSettingsPage from "../pages/PrayerSettingsPage";
import AnnouncementsPage from "../pages/AnnouncementsPage";
import SlidesPage from "../pages/SlidesPage";
import DisplayScreensPage from "../pages/DisplayScreensPage";
import AdminsPage from "../pages/AdminsPage";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 xl:grid-cols-[280px_1fr]">
        <Sidebar />

        <main className="p-6 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/prayers" element={<PrayerSettingsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/slides" element={<SlidesPage />} />
            <Route path="/display-screens" element={<DisplayScreensPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admins" element={<AdminsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}