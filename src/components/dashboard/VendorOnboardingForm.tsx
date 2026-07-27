"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { VENDOR_TYPES, VENDOR_TYPE_LABELS, type VendorType } from "@/lib/vendor/model";

/**
 * Staff vendor-onboarding intake (internal console, dark theme).
 *
 * Phase 3 is staff-managed onboarding: an operations-team member captures the
 * supplier, and verification/activation remain separate human decisions made on
 * the register — this form never grants trust.
 *
 * Posts to /api/vendors/onboarding, which is Basic-Auth gated by the console
 * proxy; the browser resends the console credentials automatically for this
 * same-origin request. Validation is authoritative on the server (the shared Zod
 * schema); the client only renders what the server returns.
 */

type Field =
  | "businessName"
  | "type"
  | "ownerName"
  | "phone"
  | "email"
  | "city"
  | "state"
  | "destinations"
  | "gst"
  | "pan"
  | "businessAgeYears"
  | "googleReviewsUrl"
  | "notes"
  | "assignedTo";

type Result = {
  stageLabel: string;
  completeness: number;
  blockers: string[];
  persisted: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white/85 outline-none transition-colors placeholder:text-white/25 focus:border-gold/50";
const labelClass = "mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40";

const EMPTY: Record<Field, string> = {
  businessName: "",
  type: "hotel",
  ownerName: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  destinations: "",
  gst: "",
  pan: "",
  businessAgeYears: "",
  googleReviewsUrl: "",
  notes: "",
  assignedTo: "",
};

export default function VendorOnboardingForm() {
  const [values, setValues] = useState<Record<Field, string>>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setErrors({});

    const payload = {
      ...values,
      // Comma-separated in the UI, an array on the wire.
      destinations: values.destinations
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      businessAgeYears: values.businessAgeYears ? Number(values.businessAgeYears) : undefined,
    };

    try {
      const res = await fetch("/api/vendors/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? "Couldn't record the supplier.");
        return;
      }

      setResult({
        stageLabel: data.stageLabel,
        completeness: data.completeness,
        blockers: data.blockers ?? [],
        persisted: Boolean(data.persisted),
      });
      setValues(EMPTY);
    } catch {
      setFormError("Network error — the supplier was not recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-5">
        <p className="text-[13.5px] font-medium text-white/85">Supplier captured</p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2">
            <dt className="text-[12px] text-white/50">Stage</dt>
            <dd className="font-mono text-[11.5px] text-gold">{result.stageLabel}</dd>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2">
            <dt className="text-[12px] text-white/50">Completeness</dt>
            <dd className="font-mono text-[11.5px] tabular-nums text-white/80">{result.completeness}%</dd>
          </div>
        </dl>

        {result.blockers.length > 0 && (
          <div className="mt-3">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
              Outstanding before verification
            </p>
            <ul className="mt-1.5 space-y-1">
              {result.blockers.map((b) => (
                <li key={b} className="text-[12px] text-amber-200/70">
                  · {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!result.persisted && (
          <p
            data-scaffold="true"
            className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2.5 text-[12px] leading-relaxed text-amber-200/80"
          >
            Recorded to the server log only — <strong>not saved to a database</strong>. The
            onboarding repository is a console stub until <code>DATABASE_URL</code> is
            configured; re-enter this supplier once the backend is live.
          </p>
        )}

        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-4 rounded-lg border border-white/12 px-3.5 py-2 text-[12px] text-white/70 transition-colors hover:border-gold/40 hover:text-white"
        >
          Onboard another supplier
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" error={errors.businessName} required>
          <input
            className={cn(inputClass, errors.businessName && "border-red-400/50")}
            value={values.businessName}
            onChange={set("businessName")}
            placeholder="Registered name"
          />
        </Field>

        <Field label="Category" error={errors.type} required>
          <select className={inputClass} value={values.type} onChange={set("type")}>
            {VENDOR_TYPES.map((t) => (
              <option key={t} value={t} className="bg-[#12110f]">
                {VENDOR_TYPE_LABELS[t as VendorType]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Owner / contact name" error={errors.ownerName}>
          <input className={inputClass} value={values.ownerName} onChange={set("ownerName")} />
        </Field>

        <Field label="Assigned to (ops)" error={errors.assignedTo}>
          <input className={inputClass} value={values.assignedTo} onChange={set("assignedTo")} />
        </Field>

        <Field label="Phone" error={errors.phone}>
          <input
            className={cn(inputClass, errors.phone && "border-red-400/50")}
            value={values.phone}
            onChange={set("phone")}
            placeholder="+91…"
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            className={cn(inputClass, errors.email && "border-red-400/50")}
            value={values.email}
            onChange={set("email")}
          />
        </Field>

        <Field label="City" error={errors.city}>
          <input className={inputClass} value={values.city} onChange={set("city")} />
        </Field>

        <Field label="State" error={errors.state}>
          <input className={inputClass} value={values.state} onChange={set("state")} />
        </Field>
      </div>

      <Field label="Destinations served (comma separated)" error={errors.destinations}>
        <input
          className={inputClass}
          value={values.destinations}
          onChange={set("destinations")}
          placeholder="e.g. manali, kashmir"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="GST" error={errors.gst}>
          <input
            className={cn(inputClass, errors.gst && "border-red-400/50")}
            value={values.gst}
            onChange={set("gst")}
          />
        </Field>
        <Field label="PAN" error={errors.pan}>
          <input
            className={cn(inputClass, errors.pan && "border-red-400/50")}
            value={values.pan}
            onChange={set("pan")}
          />
        </Field>
        <Field label="Years in business" error={errors.businessAgeYears}>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={values.businessAgeYears}
            onChange={set("businessAgeYears")}
          />
        </Field>
        <Field label="Google reviews URL" error={errors.googleReviewsUrl}>
          <input
            className={cn(inputClass, errors.googleReviewsUrl && "border-red-400/50")}
            value={values.googleReviewsUrl}
            onChange={set("googleReviewsUrl")}
          />
        </Field>
      </div>

      <Field label="Operations notes" error={errors.notes}>
        <textarea
          rows={3}
          className={cn(inputClass, "resize-y")}
          value={values.notes}
          onChange={set("notes")}
          placeholder="Context from the site visit / call…"
        />
      </Field>

      {formError && (
        <p role="alert" className="text-[12.5px] text-red-300/90">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-[12.5px] font-medium text-gold transition-colors hover:bg-gold/15 disabled:opacity-50"
        >
          {submitting ? "Recording…" : "Capture supplier"}
        </button>
        <p className="text-[11.5px] text-white/35">
          Captured as <span className="text-white/55">unverified</span>. Verification and
          activation are separate human decisions.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required && <span className="ml-1 text-gold/70">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11.5px] text-red-300/90">{error}</span>}
    </label>
  );
}
