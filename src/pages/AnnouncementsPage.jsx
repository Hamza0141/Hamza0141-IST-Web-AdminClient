import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../services/announcementApi";

const emptyForm = {
  title: "",
  body: "",
  priority: "medium",
  start_at: "",
  end_at: "",
  is_active: 1,
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadAnnouncements() {
    const data = await getAnnouncements();
    setAnnouncements(data.announcements || []);
  }

  useEffect(() => {
    loadAnnouncements().catch((err) => setMessage(err.message));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? Number(checked) : value }));
  }

  function toPayload(values) {
    return {
      ...values,
      start_at: values.start_at ? values.start_at.replace("T", " ") + ":00" : null,
      end_at: values.end_at ? values.end_at.replace("T", " ") + ":00" : null,
      is_active: Number(values.is_active),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");

      if (editingId) {
        await updateAnnouncement(editingId, toPayload(form));
        setMessage("Announcement updated.");
      } else {
        await createAnnouncement(toPayload(form));
        setMessage("Announcement created.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadAnnouncements();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      body: item.body || "",
      priority: item.priority || "medium",
      start_at: item.start_at ? item.start_at.slice(0, 16) : "",
      end_at: item.end_at ? item.end_at.slice(0, 16) : "",
      is_active: item.is_active ? 1 : 0,
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    await loadAnnouncements();
  }

  return (
    <PageShell
      title="Announcements"
      description="Manage public announcements for the mobile app and TV displays."
    >
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Announcement" : "Create Announcement"}
          </h2>

          <div className="mt-4 space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Title"
              required
            />

            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              className="h-40 w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Announcement body"
              required
            />

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="grid gap-4 md:grid-cols-2">
              <input name="start_at" value={form.start_at} onChange={handleChange} type="datetime-local" className="rounded-2xl border border-slate-300 px-4 py-3" />
              <input name="end_at" value={form.end_at} onChange={handleChange} type="datetime-local" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input name="is_active" type="checkbox" checked={!!form.is_active} onChange={handleChange} className="h-5 w-5 accent-emerald-600" />
              Active
            </label>

            <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
              {editingId ? "Update Announcement" : "Publish Announcement"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Current Announcements</h2>

          <div className="mt-4 space-y-4">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="font-semibold">{item.title}</div>
                <p className="mt-1 text-sm text-slate-500">{item.body}</p>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleEdit(item)} className="rounded-xl border px-3 py-2 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}