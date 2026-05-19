import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  updateAdminPassword,
} from "../services/adminApi";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  admin_email: "",
  first_name: "",
  last_name: "",
  password: "",
  new_password: "",
  role: "support",
  is_active: 1,
};

export default function AdminsPage() {
  const { admin: currentAdmin, checkAuth } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const isMainAdmin = currentAdmin?.role === "admin";

  async function loadAdmins() {
    const data = await getAdmins();
    setAdmins(data.admins || []);
  }

  useEffect(() => {
    loadAdmins().catch((err) => setMessage(err.message));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? Number(checked) : value,
    }));
  }

  function handleEdit(item) {
    setEditingId(item.profile_id);

    setForm({
      admin_email: item.admin_email || "",
      first_name: item.first_name || "",
      last_name: item.last_name || "",
      password: "",
      new_password: "",
      role: item.role || "support",
      is_active: item.is_active ? 1 : 0,
    });

    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");

      if (editingId) {
        const payload = {
          admin_email: form.admin_email,
          first_name: form.first_name,
          last_name: form.last_name,
        };

        if (isMainAdmin) {
          payload.role = form.role;
          payload.is_active = Number(form.is_active);
        }

        await updateAdmin(editingId, payload);

        if (form.new_password.trim()) {
          await updateAdminPassword(editingId, {
            password: form.new_password.trim(),
          });
        }

        setMessage("Admin profile updated successfully.");

        if (currentAdmin?.profile_id === editingId && checkAuth) {
          await checkAuth();
        }
      } else {
        if (!isMainAdmin) {
          setMessage("Only admin users can create new accounts.");
          return;
        }

        await createAdmin({
          admin_email: form.admin_email,
          first_name: form.first_name,
          last_name: form.last_name,
          password: form.password,
          role: form.role,
        });

        setMessage("Admin account created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadAdmins();
    } catch (error) {
      setMessage(error.message || "Failed to save admin.");
    }
  }

  const selectedAdmin = admins.find((item) => item.profile_id === editingId);
  const isEditingSelf = currentAdmin?.profile_id === editingId;

  return (
    <PageShell
      title="Admins"
      description="Create admins, update profiles, roles, and passwords."
    >
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {isMainAdmin || editingId ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {editingId
                ? `Edit ${selectedAdmin?.first_name || "Admin"}`
                : "Create Admin"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update profile details and optionally set a new password."
                : "Create a new admin or support user."}
            </p>

            <div className="mt-4 space-y-4">
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="First name"
                required
              />

              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="Last name"
                required
              />

              <input
                name="admin_email"
                type="email"
                value={form.admin_email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="Email"
                required
              />

              {!editingId ? (
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Temporary password"
                  required
                  disabled={!isMainAdmin}
                />
              ) : (
                <input
                  name="new_password"
                  type="password"
                  value={form.new_password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="New password (leave blank to keep current)"
                />
              )}

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={!isMainAdmin}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 disabled:bg-slate-100"
              >
                <option value="admin">Admin</option>
                <option value="support">Support</option>
              </select>

              {isMainAdmin ? (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    name="is_active"
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={handleChange}
                    className="h-5 w-5 accent-emerald-600"
                  />
                  Active account
                </label>
              ) : null}

              {!isMainAdmin && editingId && !isEditingSelf ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  Support users can only update their own profile.
                </div>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!isMainAdmin && editingId && !isEditingSelf}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingId ? "Update" : "Create"}
                </button>

                {editingId ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">My Access</h2>
            <p className="mt-2 text-slate-500">
              Support users can view admin users and update their own profile
              only. Select your account from the list to edit your profile or
              password.
            </p>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Admin Users</h2>

          <div className="mt-4 space-y-4">
            {admins.map((item) => {
              const isSelf = currentAdmin?.profile_id === item.profile_id;
              const canEdit = isMainAdmin || isSelf;

              return (
                <div
                  key={item.profile_id}
                  className={`rounded-2xl border p-4 ${
                    editingId === item.profile_id
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {item.first_name} {item.last_name}
                        {isSelf ? (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase text-emerald-700">
                            You
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        {item.admin_email}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                          {item.role}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            item.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {canEdit ? (
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {!admins.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                No admin users found.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  );
}