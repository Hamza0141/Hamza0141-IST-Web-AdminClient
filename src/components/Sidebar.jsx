import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Clock3,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MonitorSmartphone,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-emerald-600 text-white shadow-lg"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, admin } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="border-r border-slate-200 bg-white p-6">
      <div className="mb-6 rounded-3xl bg-emerald-600 p-5 text-white shadow-lg">
        <div className="text-sm uppercase tracking-[0.2em] text-emerald-100">
          Mosque Admin
        </div>

        <div className="mt-2 text-2xl font-bold leading-tight">
          Islamic Society of Tulsa
        </div>

        <div className="mt-1 text-sm text-emerald-100">Admin Dashboard</div>
      </div>

      
      <nav className="space-y-2">
        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Overview" />
        <SidebarLink to="/prayers" icon={Clock3} label="Prayer Settings" />
        <SidebarLink
          to="/announcements"
          icon={Megaphone}
          label="Announcements"
        />
        <SidebarLink to="/slides" icon={Images} label="Slides" />
        <SidebarLink
          to="/display-screens"
          icon={MonitorSmartphone}
          label="Display Screens"
        />
        <SidebarLink to="/admins" icon={Users} label="Admins" />
      </nav>

      <button
        onClick={handleLogout}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}