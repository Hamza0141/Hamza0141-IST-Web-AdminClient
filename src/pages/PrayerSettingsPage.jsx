import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { getPrayers, updatePrayer } from "../services/prayerApi";
import { getPublicPrayers } from "../services/publicApi";

function formatTime(timeString) {
  if (!timeString) return "--";
  const [hourStr, minute] = String(timeString).split(":");
  let hour = Number(hourStr);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

function toTimeInput(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function isJumuah(prayerName) {
  return prayerName === "Jumuah1" || prayerName === "Jumuah2";
}

function updatedByText(prayer) {
  const name = [prayer.updated_by_first_name, prayer.updated_by_last_name]
    .filter(Boolean)
    .join(" ");

  return name || prayer.updated_by_email || prayer.updated_by || "--";
}

export default function PrayerSettingsPage() {
  const [prayers, setPrayers] = useState([]);
  const [publicPrayers, setPublicPrayers] = useState([]);
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPrayers() {
    try {
      setLoading(true);
      setMessage("");

      const [adminData, publicData] = await Promise.all([
        getPrayers(),
        getPublicPrayers(),
      ]);

      setPrayers(adminData.prayers || []);
      setPublicPrayers(publicData.prayers || []);
      setDirtyIds(new Set());
    } catch (error) {
      setMessage(error.message || "Failed to load prayer settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrayers();
  }, []);

  function getRealAdhan(prayerName) {
    const found = publicPrayers.find((p) => p.prayer_name === prayerName);
    return found?.adhan_time || null;
  }

  function updateLocalPrayer(id, field, value) {
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );

    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const changedPrayers = prayers.filter((p) => dirtyIds.has(p.id));

      if (!changedPrayers.length) {
        setMessage("No prayer changes to save.");
        return;
      }

      await Promise.all(
        changedPrayers.map((p) => {
          const payload = {
            iqama_time: p.iqama_time,
          };

          if (isJumuah(p.prayer_name)) {
            payload.adhan_time = p.adhan_time;
          }

          return updatePrayer(p.id, payload);
        })
      );

      setMessage(`${changedPrayers.length} prayer setting saved successfully.`);
      await loadPrayers();
    } catch (error) {
      setMessage(error.message || "Failed to save prayer settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="Prayer Settings"
      description="Adhan times are fetched live from the prayer API. Jumuah adhan and iqama are custom and admin-managed."
      actionLabel={saving ? "Saving..." : "Save Changes"}
      onAction={handleSave}
    >
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="py-10 text-center text-slate-500">
            Loading prayer settings...
          </div>
        ) : (
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                <th className="px-4 py-3">Prayer</th>
                <th className="px-4 py-3">Adhan</th>
                <th className="px-4 py-3">Iqama</th>
                <th className="px-4 py-3">Last Updated By</th>
                <th className="px-4 py-3">Updated At</th>
              </tr>
            </thead>

            <tbody>
              {prayers.map((p) => {
                const customJumuah = isJumuah(p.prayer_name);
                const realAdhan = getRealAdhan(p.prayer_name);

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 last:border-b-0 ${
                      dirtyIds.has(p.id) ? "bg-emerald-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {p.prayer_name}
                    </td>

                    <td className="px-4 py-4">
                      {customJumuah ? (
                        <input
                          type="time"
                          value={toTimeInput(p.adhan_time)}
                          onChange={(e) =>
                            updateLocalPrayer(
                              p.id,
                              "adhan_time",
                              `${e.target.value}:00`
                            )
                          }
                          className="w-40 rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <span className="text-slate-700">
                          {formatTime(realAdhan)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="time"
                        value={toTimeInput(p.iqama_time)}
                        onChange={(e) =>
                          updateLocalPrayer(
                            p.id,
                            "iqama_time",
                            `${e.target.value}:00`
                          )
                        }
                        className="w-40 rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                      />
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {updatedByText(p)}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-500">
                      {p.updated_at
                        ? new Date(p.updated_at).toLocaleString()
                        : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </PageShell>
  );
}