"use client";

import { useId, useState } from "react";
import {
  BUDGET_RANGES,
  enquiryInputSchema,
  submitEnquiry,
  whatsappEnquiryUrl,
  type EnquiryInput,
} from "@/lib/enquiry";
import { featuredPackages } from "@/data/home";
import { company } from "@/data/company";

type FieldErrors = Partial<Record<keyof EnquiryInput, string>>;

const inputClass =
  "w-full rounded-lg border border-hair bg-bone px-3.5 py-2.5 text-sm text-ink-text outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/25";
const labelClass =
  "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted";
const errClass = "mt-1 text-[11.5px] text-[#B4432E]";

function emptyForm(): EnquiryInput {
  return {
    name: "", phone: "", email: "", city: "",
    adults: 2, children: 0, preferredDate: "",
    packageSlug: "", packageTitle: "", budgetRange: undefined,
    specialRequirements: "", source: "contact_page", campaign: "",
  };
}

/**
 * Primary contact conversion — posts through the one enquiry path
 * (`submitEnquiry`), which the CRM/Neon backend will pick up unchanged.
 * WhatsApp and Call remain as secondary support channels.
 */
export default function InquiryForm() {
  const uid = useId();
  const [form, setForm] = useState<EnquiryInput>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof EnquiryInput>(key: K, value: EnquiryInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = enquiryInputSchema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof EnquiryInput;
        if (k && !next[k]) next[k] = issue.message;
      }
      setErrors(next);
      const firstKey = Object.keys(next)[0];
      if (firstKey) document.getElementById(`${uid}-${firstKey}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("submitting");
    setServerError(null);
    const result = await submitEnquiry(parsed.data);
    if (result.ok) {
      setStatus("success");
    } else {
      if (result.fieldErrors) setErrors(result.fieldErrors);
      setServerError(result.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-paper p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pine-tint text-pine">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink-text">Enquiry received</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-text-2">
          Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""} — our team will
          reply with a written itinerary and full pricing, usually within a
          couple of hours.
        </p>
        <a
          href={whatsappEnquiryUrl(company.whatsappHref, form)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-lg border border-ink/20 px-6 py-2.5 text-sm font-semibold text-ink-text transition-colors hover:bg-ink/5"
        >
          Prefer WhatsApp? Message us now
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-ink-text">Plan my trip</h2>
      <p className="mt-1.5 text-[13px] text-ink-text-2">
        Tell us roughly what you have in mind. We reply with a written itinerary
        and full pricing — usually within a couple of hours.
      </p>

      <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-name`} className={labelClass}>Your name *</label>
          <input
            id={`${uid}-name`}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            className={`${inputClass} ${errors.name ? "border-[#B4432E]" : ""}`}
            placeholder="Aditi Sharma"
          />
          {errors.name && <p className={errClass}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} className={labelClass}>Phone *</label>
          <input
            id={`${uid}-phone`}
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            className={`${inputClass} ${errors.phone ? "border-[#B4432E]" : ""}`}
            placeholder="+91 92351 21325"
          />
          {errors.phone && <p className={errClass}>{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor={`${uid}-email`} className={labelClass}>Email</label>
          <input
            id={`${uid}-email`}
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            className={`${inputClass} ${errors.email ? "border-[#B4432E]" : ""}`}
            placeholder="you@example.com"
          />
          {errors.email && <p className={errClass}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor={`${uid}-city`} className={labelClass}>Your city</label>
          <input id={`${uid}-city`} value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} placeholder="Jhansi" />
        </div>

        <div>
          <label htmlFor={`${uid}-preferredDate`} className={labelClass}>Preferred date</label>
          <input id={`${uid}-preferredDate`} value={form.preferredDate} onChange={(e) => update("preferredDate", e.target.value)} className={inputClass} placeholder="e.g. mid-October" />
        </div>

        <div>
          <label htmlFor={`${uid}-adults`} className={labelClass}>Adults *</label>
          <input id={`${uid}-adults`} type="number" min={1} max={40} value={form.adults} onChange={(e) => update("adults", Number(e.target.value))} aria-invalid={Boolean(errors.adults)} className={`${inputClass} ${errors.adults ? "border-[#B4432E]" : ""}`} />
          {errors.adults && <p className={errClass}>{errors.adults}</p>}
        </div>

        <div>
          <label htmlFor={`${uid}-children`} className={labelClass}>Children</label>
          <input id={`${uid}-children`} type="number" min={0} max={40} value={form.children} onChange={(e) => update("children", Number(e.target.value))} className={inputClass} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-packageTitle`} className={labelClass}>Interested in</label>
          <select
            id={`${uid}-packageTitle`}
            value={form.packageTitle}
            onChange={(e) => {
              const title = e.target.value;
              const match = featuredPackages.find((p) => p.title === title);
              setForm((f) => ({ ...f, packageTitle: title, packageSlug: match?.slug ?? "" }));
            }}
            className={inputClass}
          >
            <option value="">Not sure yet — help me choose</option>
            {featuredPackages.map((p) => (
              <option key={p.slug} value={p.title}>{p.title}</option>
            ))}
            <option value="Custom trip">Something custom</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-budgetRange`} className={labelClass}>Budget range</label>
          <select id={`${uid}-budgetRange`} value={form.budgetRange ?? ""} onChange={(e) => update("budgetRange", (e.target.value || undefined) as EnquiryInput["budgetRange"])} className={inputClass}>
            <option value="">Select a range (optional)</option>
            {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-specialRequirements`} className={labelClass}>Anything else</label>
          <textarea id={`${uid}-specialRequirements`} rows={4} value={form.specialRequirements} onChange={(e) => update("specialRequirements", e.target.value)} className={`${inputClass} resize-y`} placeholder="Dates, budget, kids' ages, special occasions…" />
        </div>
      </div>

      {serverError && (
        <p role="alert" className="mt-3 rounded-lg bg-[#FFF5F5] px-3 py-2 text-[12.5px] text-[#B4432E]">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 w-full rounded-lg bg-gold py-3.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <a href={company.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-lg border border-ink/15 py-2.5 text-[13px] font-semibold text-ink-text transition-colors hover:bg-ink/5">
          WhatsApp
        </a>
        <a href={company.phoneHref} className="flex items-center justify-center rounded-lg border border-ink/15 py-2.5 text-[13px] font-semibold text-ink-text transition-colors hover:bg-ink/5">
          Call us
        </a>
      </div>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
        No payment now — we confirm availability and share full inclusions first.
      </p>
    </form>
  );
}
