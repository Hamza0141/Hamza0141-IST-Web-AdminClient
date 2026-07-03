import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";

import {
  createSlide,
  deleteSlide,
  getSlides,
  updateSlide,
} from "../services/slideApi";

import { getDisplayScreens } from "../services/displayScreenApi";

const emptyForm = {
  title: "",
  message: "",
  image_url: "",
  slide_order: 1,
  duration_seconds: 10,
  start_at: "",
  end_at: "",
  is_active: 1,
  screen_ids: [],
};

export default function SlidesPage() {
  const [slides, setSlides] = useState([]);
  const [screens, setScreens] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadSlides() {
    const data = await getSlides();
    setSlides(data.slides || []);
  }

  async function loadScreens() {
    const data = await getDisplayScreens({ activeOnly: true });
    setScreens(data.display_screens || []);
  }

  async function loadPageData() {
    await Promise.all([loadSlides(), loadScreens()]);
  }

  useEffect(() => {
    loadPageData().catch((err) => setMessage(err.message));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? Number(checked) : value,
    }));
  }

  function handleScreenToggle(screenId, checked) {
    setForm((prev) => {
      const currentIds = prev.screen_ids || [];

      if (checked) {
        return {
          ...prev,
          screen_ids: [...new Set([...currentIds, screenId])],
        };
      }

      return {
        ...prev,
        screen_ids: currentIds.filter((id) => id !== screenId),
      };
    });
  }

  function toPayload(values) {
    return {
      title: values.title,
      message: values.message || null,
      image_url: values.image_url || null,
      slide_order: Number(values.slide_order || 1),
      duration_seconds: Number(values.duration_seconds || 10),
      start_at: values.start_at
        ? values.start_at.replace("T", " ") + ":00"
        : null,
      end_at: values.end_at ? values.end_at.replace("T", " ") + ":00" : null,
      is_active: Number(values.is_active),
      screen_ids: (values.screen_ids || []).map((id) => Number(id)),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");

      if (!form.screen_ids.length) {
        setMessage("Select at least one TV/display for this slide.");
        return;
      }

      if (editingId) {
        await updateSlide(editingId, toPayload(form));
        setMessage("Slide updated.");
      } else {
        await createSlide(toPayload(form));
        setMessage("Slide created.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadSlides();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);

    const assignedScreenIds =
      item.screen_ids ||
      (item.screens || []).map((screen) => Number(screen.id));

    setForm({
      title: item.title || "",
      message: item.message || "",
      image_url: item.image_url || "",
      slide_order: item.slide_order || 1,
      duration_seconds: item.duration_seconds || 10,
      start_at: item.start_at ? item.start_at.slice(0, 16) : "",
      end_at: item.end_at ? item.end_at.slice(0, 16) : "",
      is_active: item.is_active ? 1 : 0,
      screen_ids: assignedScreenIds.map((id) => Number(id)),
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this slide?")) return;

    try {
      setMessage("");
      await deleteSlide(id);
      setMessage("Slide deleted.");
      await loadSlides();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function getAssignedScreensText(slide) {
    const assigned = slide.screens || [];

    if (!assigned.length) {
      return "No TVs assigned";
    }

    return assigned
      .map((screen) =>
        screen.location_name
          ? `${screen.screen_name} (${screen.location_name})`
          : screen.screen_name
      )
      .join(", ");
  }

  return (
    <PageShell
      title="Slides"
      description="Manage display slides, duration, ordering, and which TVs should show each slide."
    >
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Slide" : "New Slide"}
          </h2>

          <div className="mt-4 space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Slide title"
              required
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="h-32 w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Slide message"
            />

            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Image URL"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="slide_order"
                type="number"
                min="1"
                value={form.slide_order}
                onChange={handleChange}
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Order"
              />

              <input
                name="duration_seconds"
                type="number"
                min="1"
                value={form.duration_seconds}
                onChange={handleChange}
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Duration seconds"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="start_at"
                value={form.start_at}
                onChange={handleChange}
                type="datetime-local"
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <input
                name="end_at"
                value={form.end_at}
                onChange={handleChange}
                type="datetime-local"
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-800">
                Show this slide on
              </div>

              {screens.length ? (
                <div className="space-y-2">
                  {screens.map((screen) => (
                    <label
                      key={screen.id}
                      className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={(form.screen_ids || []).includes(screen.id)}
                        onChange={(e) =>
                          handleScreenToggle(screen.id, e.target.checked)
                        }
                        className="h-5 w-5 accent-emerald-600"
                      />

                      <span>
                        <span className="font-medium">
                          {screen.screen_name}
                        </span>

                        <span className="text-slate-500">
                          {" "}
                          — {screen.screen_code}
                          {screen.location_name
                            ? ` • ${screen.location_name}`
                            : ""}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  No active TVs found. Create an active display screen first.
                </div>
              )}
            </div>

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
                {editingId ? "Update Slide" : "Save Slide"}
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

        <div className="grid gap-4 md:grid-cols-2">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400">
                {slide.image_url ? (
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "No Image"
                )}
              </div>

              <div className="font-semibold text-slate-900">
                {slide.title}
              </div>

              {slide.message ? (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {slide.message}
                </p>
              ) : null}

              <div className="mt-2 text-sm text-slate-500">
                Order {slide.slide_order} • {slide.duration_seconds}s •{" "}
                {slide.is_active ? "Active" : "Inactive"}
              </div>

              <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">TVs: </span>
                {getAssignedScreensText(slide)}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(slide)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(slide.id)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!slides.length ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm md:col-span-2">
              No slides found.
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}