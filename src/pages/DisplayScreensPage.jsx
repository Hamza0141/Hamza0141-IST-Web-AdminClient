import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import {
  createDisplayScreen,
  deleteDisplayScreen,
  getDisplayScreens,
  updateDisplayScreen,
} from "../services/displayScreenApi";

const emptyForm = {
  screen_name: "",
  screen_code: "",
  location_name: "",
  device_token: "",
  is_active: 1,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DisplayScreensPage() {
  const [screens, setScreens] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadScreens() {
    const data = await getDisplayScreens();
    setScreens(data.display_screens || []);
  }

  useEffect(() => {
    loadScreens().catch((err) => setMessage(err.message));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? Number(checked) : value,
      };

      if (name === "screen_name" && !editingId) {
        next.screen_code = slugify(value);
      }

      return next;
    });
  }

  function toPayload(values) {
    return {
      screen_name: values.screen_name,
      screen_code: values.screen_code,
      location_name: values.location_name || null,
      device_token: values.device_token || null,
      is_active: Number(values.is_active),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");

      if (editingId) {
        await updateDisplayScreen(editingId, toPayload(form));
        setMessage("Display screen updated.");
      } else {
        await createDisplayScreen(toPayload(form));
        setMessage("Display screen created.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadScreens();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      screen_name: item.screen_name || "",
      screen_code: item.screen_code || "",
      location_name: item.location_name || "",
      device_token: item.device_token || "",
      is_active: item.is_active ? 1 : 0,
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this display screen?")) return;

    try {
      await deleteDisplayScreen(id);
      await loadScreens();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function openDisplay(screenCode) {
    const tvUrl = `http://localhost:5174/display/${screenCode}`;
    window.open(tvUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <PageShell
      title="Display Screens"
      description="Register TVs and manage public display screen codes."
    >
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Display Screen" : "Add Display Screen"}
          </h2>

          <div className="mt-4 space-y-4">
            <input
              name="screen_name"
              value={form.screen_name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Lobby TV"
              required
            />

            <input
              name="screen_code"
              value={form.screen_code}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="lobby-tv"
              required
            />

            <input
              name="location_name"
              value={form.location_name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Front Lobby"
            />

            <input
              name="device_token"
              value={form.device_token}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Optional device token"
            />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                name="is_active"
                type="checkbox"
                checked={!!form.is_active}
                onChange={handleChange}
                className="h-5 w-5 accent-emerald-600"
              />
              Active
            </label>

            <div className="flex gap-3">
              <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
                {editingId ? "Update Screen" : "Create Screen"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                <th className="px-4 py-3">Screen Name</th>
                <th className="px-4 py-3">Screen Code</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {screens.map((screen) => (
                <tr
                  key={screen.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-4 py-4 font-semibold">
                    {screen.screen_name}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {screen.screen_code}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {screen.location_name || "--"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        screen.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {screen.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(screen)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => openDisplay(screen.screen_code)}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
                      >
                        Open TV
                      </button>

                      <button
                        onClick={() => handleDelete(screen.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!screens.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                    No display screens found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}