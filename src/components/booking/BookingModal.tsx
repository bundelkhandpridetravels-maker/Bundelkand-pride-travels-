"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BUDGET_RANGES,
  enquiryInputSchema,
  submitEnquiry,
  whatsappEnquiryUrl,
  type EnquiryInput,
} from "@/lib/enquiry";
import { company } from "@/data/company";
import type { BookingContextValue } from "./BookingProvider";

type Props = {
  isOpen: boolean;
  context: BookingContextValue;
  onClose: () => void;
};

type FieldErrors = Partial<Record<keyof EnquiryInput, string>>;

const inputBase =
  "w-full rounded-lg border border-hair bg-bone px-3.5 py-2.5 text-sm text-ink-text outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/25";
const labelBase = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted";
const errBase = "mt-1 text-[11.5px] text-[#B4432E]";

function emptyForm(): EnquiryInput {
  return {
    name: "", phone: "", email: "", city: "",
    adults: 2, children: 0, preferredDate: "",
    packageSlug: "", packageTitle: "", budgetRange: undefined,
    specialRequirements: "", source: "general", campaign: "",
  };
}

export default function BookingModal({ isOpen, context, onClose }: Props) {
  const uid = useId();
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<EnquiryInput>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  // Reset the form to the incoming package context each time the modal opens.
  // Intentional open-time sync of prop → local form state; the "avoid setState in
  // effect" heuristic doesn't apply to this one-shot initialization.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;
    setForm((f) => ({
      ...emptyForm(),
      ...f,
      packageSlug: context.slug ?? "",
      packageTitle: context.title ?? "",
      source: context.source,
    }));
    setErrors({});
    setStatus("idle");
    setServerError(null);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [isOpen, context.slug, context.title, context.source]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

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

  const isSeat = context.isGroup;
  const heading = isSeat ? "Reserve your seat" : "Book this trip";
  const waHref = whatsappEnquiryUrl(company.whatsappHref, form);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-bone p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-8"
            initial={{ y: reduce ? 0 : 24, opacity: 0, scale: reduce ? 1 : 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: reduce ? 0 : 24, opacity: 0, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-hair hover:text-ink-text"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {status === "success" ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pine-tint text-pine">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-semibold text-ink-text">
                  Enquiry received
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-text-2">
                  Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""} — our
                  travel team will reach out with a written itinerary and pricing,
                  usually within a couple of hours.
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-ink/20 py-2.5 text-sm font-semibold text-ink-text transition-colors hover:bg-ink/5"
                  >
                    Prefer WhatsApp? Message us now
                  </a>
                  <button
                    onClick={onClose}
                    className="rounded-lg bg-gold py-2.5 text-sm font-bold text-ink"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-dim">
                  {isSeat ? "Group departure" : "Private tour"}
                </p>
                <h2 id={`${uid}-title`} className="mt-1 font-display text-2xl font-semibold text-ink-text">
                  {heading}
                </h2>
                {context.title && (
                  <p className="mt-1 text-[13.5px] text-ink-text-2">{context.title}</p>
                )}
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  No payment now. We confirm availability and share full
                  inclusions before anything is booked.
                </p>

                <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor={`${uid}-name`} className={labelBase}>Full name *</label>
                    <input
                      ref={firstFieldRef}
                      id={`${uid}-name`}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      className={`${inputBase} ${errors.name ? "border-[#B4432E]" : ""}`}
                      placeholder="Aditi Sharma"
                    />
                    {errors.name && <p className={errBase}>{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${uid}-phone`} className={labelBase}>Phone *</label>
                    <input
                      id={`${uid}-phone`}
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      className={`${inputBase} ${errors.phone ? "border-[#B4432E]" : ""}`}
                      placeholder="+91 92351 21325"
                    />
                    {errors.phone && <p className={errBase}>{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${uid}-email`} className={labelBase}>Email</label>
                    <input
                      id={`${uid}-email`}
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      className={`${inputBase} ${errors.email ? "border-[#B4432E]" : ""}`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className={errBase}>{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${uid}-city`} className={labelBase}>Your city</label>
                    <input
                      id={`${uid}-city`}
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      className={inputBase}
                      placeholder="Jhansi"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${uid}-preferredDate`} className={labelBase}>Preferred date</label>
                    <input
                      id={`${uid}-preferredDate`}
                      value={form.preferredDate}
                      onChange={(e) => update("preferredDate", e.target.value)}
                      className={inputBase}
                      placeholder="Approx. — e.g. mid-October"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${uid}-adults`} className={labelBase}>Adults *</label>
                    <input
                      id={`${uid}-adults`}
                      type="number"
                      min={1}
                      max={40}
                      value={form.adults}
                      onChange={(e) => update("adults", Number(e.target.value))}
                      aria-invalid={Boolean(errors.adults)}
                      className={`${inputBase} ${errors.adults ? "border-[#B4432E]" : ""}`}
                    />
                    {errors.adults && <p className={errBase}>{errors.adults}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${uid}-children`} className={labelBase}>Children</label>
                    <input
                      id={`${uid}-children`}
                      type="number"
                      min={0}
                      max={40}
                      value={form.children}
                      onChange={(e) => update("children", Number(e.target.value))}
                      className={inputBase}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`${uid}-budgetRange`} className={labelBase}>Budget range</label>
                    <select
                      id={`${uid}-budgetRange`}
                      value={form.budgetRange ?? ""}
                      onChange={(e) =>
                        update("budgetRange", (e.target.value || undefined) as EnquiryInput["budgetRange"])
                      }
                      className={inputBase}
                    >
                      <option value="">Select a range (optional)</option>
                      {BUDGET_RANGES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={`${uid}-specialRequirements`} className={labelBase}>
                      Special requirements
                    </label>
                    <textarea
                      id={`${uid}-specialRequirements`}
                      rows={3}
                      value={form.specialRequirements}
                      onChange={(e) => update("specialRequirements", e.target.value)}
                      className={`${inputBase} resize-y`}
                      placeholder="Dietary needs, anniversary, preferred hotel category, kids' ages…"
                    />
                  </div>
                </div>

                {serverError && (
                  <p role="alert" className="mt-3 rounded-lg bg-[#FFF5F5] px-3 py-2 text-[12.5px] text-[#B4432E]">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-5 w-full rounded-lg bg-gold py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {status === "submitting" ? "Sending…" : isSeat ? "Reserve my seat" : "Send booking enquiry"}
                </button>

                <div className="mt-3 flex items-center gap-3">
                  <span className="h-px flex-1 bg-hair" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">or</span>
                  <span className="h-px flex-1 bg-hair" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-ink/15 py-2.5 text-[13px] font-semibold text-ink-text transition-colors hover:bg-ink/5"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={company.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-lg border border-ink/15 py-2.5 text-[13px] font-semibold text-ink-text transition-colors hover:bg-ink/5"
                  >
                    Call us
                  </a>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
