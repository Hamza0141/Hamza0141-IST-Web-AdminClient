import React from "react";

export default function PageShell({ title, description, actionLabel, onAction, children }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-slate-500">{description}</p>
        </div>

        {actionLabel ? (
          <button
            onClick={onAction}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>

      {children}
    </div>
  );
}