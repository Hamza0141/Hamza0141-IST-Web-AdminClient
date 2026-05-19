import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";
import { getPrayers } from "../services/prayerApi";
import { getAnnouncements } from "../services/announcementApi";
import { getSlides } from "../services/slideApi";
import { getDisplayScreens } from "../services/displayScreenApi";
import { getPublicPrayers } from "../services/publicApi";
import mosqueLogo from "../assets/logo/ISTlogo.png";
import { useAuth } from "../context/AuthContext";

function formatTime(timeString) {
    const { logout, admin } = useAuth();
  if (!timeString) return "--";

  const [hourStr, minute] = String(timeString).split(":");
  let hour = Number(hourStr);

  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${suffix}`;
}

function formatClock(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function getNextPrayer(prayers) {
  if (!Array.isArray(prayers) || prayers.length === 0) return null;

  const now = new Date();

  for (const prayer of prayers) {
    if (!prayer?.adhan_time) continue;

    const [h, m] = String(prayer.adhan_time).split(":").map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(h, m, 0, 0);

    if (prayerDate > now) {
      return {
        ...prayer,
        prayerDate,
      };
    }
  }

  return null;
}

function getCountdown(targetDate) {
  if (!targetDate) return "--";

  const diffMs = targetDate.getTime() - Date.now();
  if (diffMs <= 0) return "Now";

  const totalMin = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function AnalogClock({ clock }) {
  const seconds = clock.getSeconds();
  const minutes = clock.getMinutes();
  const hours = clock.getHours();

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const markers = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[260px] w-[260px] rounded-full border-[6px] border-slate-300 bg-white shadow-xl">
        {markers.map((marker) => {
          const rotation = marker * 30;
          const isMain = marker % 3 === 0;

          return (
            <div
              key={marker}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            >
              <div
                className={`rounded-full ${
                  isMain ? "h-3.5 w-3.5 bg-slate-400" : "h-2 w-2 bg-slate-300"
                }`}
                style={{
                  transform: "translateY(-102px)",
                }}
              />
            </div>
          );
        })}

        <div className="absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-50 shadow">
          <div className="h-8 w-8 rounded-full bg-emerald-600" />
        </div>

        <div
          className="absolute left-1/2 top-1/2 z-10 h-[62px] w-[7px] origin-bottom rounded-full bg-slate-600"
          style={{
            transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 z-10 h-[86px] w-[5px] origin-bottom rounded-full bg-slate-400"
          style={{
            transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 z-10 h-[96px] w-[2px] origin-bottom rounded-full bg-red-500"
          style={{
            transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
          }}
        />

        <div className="absolute left-1/2 top-1/2 z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-600" />
        <div className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
                  <img
                    src={mosqueLogo}
                    alt="Mosque logo"
                    className="h-10 w-10 object-contain"
                  />
                </div>
      </div>

      <div className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
        {formatClock(clock)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [clock, setClock] = useState(new Date());
    const { logout, admin } = useAuth();

  const [stats, setStats] = useState({
    prayers: 0,
    announcements: 0,
    slides: 0,
    screens: 0,
  });

  const [prayerData, setPrayerData] = useState({
    prayers: [],
    hijri: null,
    readable_date: "",
  });

  const [loadingPrayers, setLoadingPrayers] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prayers, announcements, slides, screens] = await Promise.all([
          getPrayers(),
          getAnnouncements(),
          getSlides(),
          getDisplayScreens(),
        ]);

        setStats({
          prayers: prayers.count || prayers.prayers?.length || 0,
          announcements:
            announcements.count || announcements.announcements?.length || 0,
          slides: slides.count || slides.slides?.length || 0,
          screens: screens.count || screens.display_screens?.length || 0,
        });
      } catch (error) {
        console.log("Dashboard stats error:", error.message);
      }
    }

    async function loadPublicPrayers() {
      try {
        setLoadingPrayers(true);
        const data = await getPublicPrayers();

        setPrayerData({
          prayers: data.prayers || [],
          hijri: data.hijri || null,
          readable_date: data.readable_date || "",
        });
      } catch (error) {
        console.log("Public prayers error:", error.message);
      } finally {
        setLoadingPrayers(false);
      }
    }

    loadStats();
    loadPublicPrayers();

    const interval = setInterval(loadPublicPrayers, 30000);
    return () => clearInterval(interval);
  }, []);

  const nextPrayer = useMemo(
    () => getNextPrayer(prayerData.prayers),
    [prayerData.prayers, clock]
  );

  const hijriText = useMemo(() => {
    const hijri = prayerData.hijri;
    if (!hijri) return "";

    const monthEn = hijri?.month?.en || "";
    const monthAr = hijri?.month?.ar || "";

    return `${hijri.day} ${monthEn} ${
      monthAr ? `(${monthAr})` : ""
    } ${hijri.year}`;
  }, [prayerData.hijri]);

  return (
    <PageShell>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-slate-500">
          Quick view of prayer settings, announcements, slides, and display screens.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-right shadow-sm">
        

        <div className="mt-1 font-semibold text-slate-900">
          Welcome {admin?.first_name} {admin?.last_name}
        </div>

        <div className="mt-1 text-sm capitalize text-slate-500">
          {admin?.role}
        </div>
      </div>
    </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prayer Settings" value={stats.prayers} hint="Active prayer rows" />
        <StatCard label="Announcements" value={stats.announcements} hint="Total records" />
        <StatCard label="Slides" value={stats.slides} hint="Display content" />
        <StatCard label="Display Screens" value={stats.screens} hint="Registered TVs" />

      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 text-sm uppercase tracking-[0.2em] text-emerald-600">
            Live Clock
          </div>

          <AnalogClock clock={clock} />

          {hijriText ? (
            <div className="mt-6 text-center text-xl font-semibold text-slate-700">
              {hijriText}
            </div>
          ) : null}

          {prayerData.readable_date ? (
            <div className="mt-1 text-center text-slate-500">
              {prayerData.readable_date}
            </div>
          ) : null}

          {nextPrayer ? (
            <div className="mt-6 rounded-3xl bg-emerald-50 p-5 text-center">
              <div className="text-sm font-semibold uppercase text-emerald-700">
                Next Prayer
              </div>
              <div className="mt-2 text-3xl font-bold text-emerald-800">
                {nextPrayer.prayer_name}
              </div>
              <div className="mt-1 text-lg text-emerald-700">
                Adhan at {formatTime(nextPrayer.adhan_time)} •{" "}
                {getCountdown(nextPrayer.prayerDate)}
              </div>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">
              Today’s Prayer Times
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Adhan from prayer API, iqama from admin settings.
            </p>
          </div>

          {loadingPrayers ? (
            <div className="p-10 text-center text-slate-500">
              Loading prayer times...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="px-6 py-3">Prayer</th>
                  <th className="px-6 py-3 text-center">Adhan</th>
                  <th className="px-6 py-3 text-center">Iqama</th>
                </tr>
              </thead>

              <tbody>
                {prayerData.prayers.map((p) => {
                  const isNext = nextPrayer?.prayer_name === p.prayer_name;

                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-slate-100 last:border-b-0 ${
                        isNext ? "bg-emerald-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {p.prayer_name}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700">
                        {formatTime(p.adhan_time)}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-emerald-700">
                        {formatTime(p.iqama_time)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageShell>
  );
}