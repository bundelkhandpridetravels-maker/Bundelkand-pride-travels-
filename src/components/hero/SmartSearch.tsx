"use client";

import { useId, useState } from "react";
import {
  searchDestinations,
  searchMonths,
  searchBudgets,
  searchTravellers,
} from "@/data/destinations";

const fieldClass =
  "w-full bg-transparent text-cream text-sm font-medium outline-none " +
  "[&>option]:bg-ink-raised [&>option]:text-cream";

/**
 * Floating glassmorphism search panel.
 * Front-end only for now: on submit it surfaces a friendly confirmation.
 * Wiring to the real package search is a Phase-1B backend task.
 */
export default function SmartSearch() {
  const uid = useId();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [form, setForm] = useState({
    destination: searchDestinations[0],
    month: searchMonths[0],
    budget: searchBudgets[0],
    travellers: searchTravellers[1],
  });

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(
      `Finding ${form.travellers.toLowerCase()} trips to ${form.destination} · ${form.month} · ${form.budget}. Our team will confirm live availability.`,
    );
  }

  const fields = [
    { key: "destination" as const, label: "Destination", options: searchDestinations },
    { key: "month" as const, label: "Travel month", options: searchMonths },
    { key: "budget" as const, label: "Budget", options: searchBudgets },
    { key: "travellers" as const, label: "Travellers", options: searchTravellers },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="bpt-glass rounded-2xl p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
    >
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
        {fields.map((f, i) => (
          <div
            key={f.key}
            className={`px-4 py-2.5 lg:border-r lg:border-cream/10 ${
              i === 0 ? "" : ""
            }`}
          >
            <label
              htmlFor={`${uid}-${f.key}`}
              className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.1em] text-mist"
            >
              {f.label}
            </label>
            <select
              id={`${uid}-${f.key}`}
              className={fieldClass}
              value={form[f.key]}
              onChange={update(f.key)}
            >
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}

        <button
          type="submit"
          className="m-1 flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-semibold text-sm text-ink transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Search trips
        </button>
      </div>

      <p aria-live="polite" className="min-h-0">
        {submitted && (
          <span className="mt-1 block px-4 pb-1 pt-2 font-mono text-[11px] leading-relaxed text-gold-bright">
            {submitted}
          </span>
        )}
      </p>
    </form>
  );
}
