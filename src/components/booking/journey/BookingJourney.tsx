"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { featuredPackages } from "@/data/home";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Eyebrow from "@/components/ui/Eyebrow";
import { buildQuote } from "@/lib/booking/quote";
import { PAYMENTS_ENABLED } from "@/lib/booking/status";
import BookingStatusTimeline from "@/components/booking/BookingStatusTimeline";
import {
  bookingRequestSchema,
  submitBooking,
  type BookingRequest,
} from "@/lib/booking/booking";

const STEPS = ["Trip", "Details", "Review"] as const;
const WHATSAPP = "919235121325"; // same public ops number shown in the footer

type Errors = Partial<Record<keyof BookingRequest, string>>;

type Form = {
  packageSlug: string;
  travelDate: string;
  adults: number;
  children: number;
  pickupPoint: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  specialRequirements: string;
};

const emptyForm = (packageSlug: string): Form => ({
  packageSlug,
  travelDate: "",
  adults: 2,
  children: 0,
  pickupPoint: "",
  name: "",
  phone: "",
  email: "",
  city: "",
  specialRequirements: "",
});

function LabeledInput({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-text">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
      {error && (
        <span className="mt-1 block text-[12px] font-medium text-red-600" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-bone px-3.5 py-2.5 text-[14px] text-ink-text outline-none transition-colors focus:border-gold";

export default function BookingJourney({
  initialPackageSlug = "",
}: {
  initialPackageSlug?: string;
}) {
  const validInitial = featuredPackages.some((p) => p.slug === initialPackageSlug)
    ? initialPackageSlug
    : "";

  const [step, setStep] = useState(0); // 0..2 journey, 3 = confirmation
  const [form, setForm] = useState<Form>(emptyForm(validInitial));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string } | null>(null);

  const pkg = useMemo(
    () => featuredPackages.find((p) => p.slug === form.packageSlug),
    [form.packageSlug],
  );
  const quote = useMemo(
    () => (pkg ? buildQuote(pkg, form.adults, form.children) : null),
    [pkg, form.adults, form.children],
  );

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validateStep(current: number): boolean {
    const e: Errors = {};
    if (current === 0) {
      if (!form.packageSlug) e.packageSlug = "Choose a package.";
      if (!(form.adults >= 1)) e.adults = "At least one adult.";
    }
    if (current === 1) {
      if (form.name.trim().length < 2) e.name = "Please enter your name.";
      if (!/^[+0-9 ()-]{7,20}$/.test(form.phone.trim()))
        e.phone = "Enter a valid phone number.";
      if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
        e.email = "Enter a valid email, or leave it blank.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  async function handleSubmit() {
    setTopError(null);
    if (!consent) {
      setTopError("Please confirm you'd like us to prepare your booking.");
      return;
    }
    const payload: BookingRequest = {
      packageSlug: form.packageSlug,
      packageTitle: pkg?.title ?? form.packageSlug,
      travelDate: form.travelDate,
      adults: form.adults,
      children: form.children,
      pickupPoint: form.pickupPoint,
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      specialRequirements: form.specialRequirements,
      quoteTotal: quote?.total,
      source: "booking_journey",
    };

    const check = bookingRequestSchema.safeParse(payload);
    if (!check.success) {
      const e: Errors = {};
      for (const issue of check.error.issues) {
        const k = issue.path[0];
        if (typeof k === "string" && !e[k as keyof BookingRequest]) {
          e[k as keyof BookingRequest] = issue.message;
        }
      }
      setErrors(e);
      // Jump back to the step that owns the first error.
      if (e.packageSlug || e.adults) setStep(0);
      else if (e.name || e.phone || e.email) setStep(1);
      return;
    }

    setSubmitting(true);
    const res = await submitBooking(check.data);
    setSubmitting(false);

    if (res.ok) {
      setResult({ reference: res.reference });
      setStep(3);
    } else {
      setErrors(res.fieldErrors ?? {});
      setTopError(res.error ?? "Something went wrong. Please try again.");
    }
  }

  // ---- Confirmation (Payment Pending) ----
  if (step === 3 && result) {
    const waText = encodeURIComponent(
      `Hi, I've just requested a booking (${result.reference}) for ${pkg?.title ?? ""}. Please share the details.`,
    );
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <Badge variant="pine" className="mx-auto">Booking received</Badge>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink-text">
          Thank you, {form.name.split(" ")[0] || "traveller"} — your booking request is in.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-text-2">
          Reference{" "}
          <span className="font-mono font-semibold text-ink-text">{result.reference}</span>.
          Our team will confirm availability and share your final quote.
        </p>

        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-gold/40 bg-gold/[0.06] p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-text">Status</span>
            <Badge variant="gold">Payment pending</Badge>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-text-2">
            {PAYMENTS_ENABLED
              ? "Complete payment to confirm your seats."
              : "Online payment is being enabled. For now, our team will confirm your booking and share a secure payment link shortly."}
          </p>
        </div>

        <BookingStatusTimeline status="payment_pending" className="mx-auto mt-7 max-w-md" />

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href={`https://wa.me/${WHATSAPP}?text=${waText}`} variant="primary">
            Continue on WhatsApp
          </Button>
          <Button href="/track" variant="secondary">
            Track my booking
          </Button>
          <Button href="/packages" variant="ghost">
            Browse more trips
          </Button>
        </div>
      </Card>
    );
  }

  // ---- Journey (steps 0..2) ----
  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
                i < step
                  ? "bg-pine text-cream"
                  : i === step
                    ? "bg-gold text-ink"
                    : "border border-line text-muted",
              )}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={cn("text-[12.5px] font-medium", i === step ? "text-ink-text" : "text-muted")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" />}
          </li>
        ))}
      </ol>

      {topError && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700" role="alert">
          {topError}
        </div>
      )}

      {/* Step 0 — Trip */}
      {step === 0 && (
        <Card className="p-6 sm:p-7">
          <Eyebrow>Your trip</Eyebrow>
          <div className="mt-5 grid gap-5">
            <LabeledInput label="Package" error={errors.packageSlug}>
              <select
                className={inputClass}
                value={form.packageSlug}
                onChange={(e) => set("packageSlug", e.target.value)}
              >
                <option value="">Select a package…</option>
                {featuredPackages.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title} — {formatINR(p.priceFrom)} {p.priceUnit}
                  </option>
                ))}
              </select>
            </LabeledInput>

            <div className="grid gap-5 sm:grid-cols-2">
              <LabeledInput label="Preferred travel date" hint="Approximate is fine">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 15 Oct 2026"
                  value={form.travelDate}
                  onChange={(e) => set("travelDate", e.target.value)}
                />
              </LabeledInput>
              <LabeledInput label="Pickup point" hint="Airport / station / city">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Delhi"
                  value={form.pickupPoint}
                  onChange={(e) => set("pickupPoint", e.target.value)}
                />
              </LabeledInput>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <LabeledInput label="Adults" error={errors.adults}>
                <input
                  type="number"
                  min={1}
                  max={40}
                  className={inputClass}
                  value={form.adults}
                  onChange={(e) => set("adults", Number(e.target.value))}
                />
              </LabeledInput>
              <LabeledInput label="Children" hint="Under 12">
                <input
                  type="number"
                  min={0}
                  max={40}
                  className={inputClass}
                  value={form.children}
                  onChange={(e) => set("children", Number(e.target.value))}
                />
              </LabeledInput>
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <Button onClick={next}>Continue</Button>
          </div>
        </Card>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <Card className="p-6 sm:p-7">
          <Eyebrow>Your details</Eyebrow>
          <div className="mt-5 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <LabeledInput label="Full name" error={errors.name}>
                <input
                  type="text"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </LabeledInput>
              <LabeledInput label="Phone" error={errors.phone}>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+91…"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </LabeledInput>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <LabeledInput label="Email (optional)" error={errors.email}>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </LabeledInput>
              <LabeledInput label="City (optional)">
                <input
                  type="text"
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </LabeledInput>
            </div>
            <LabeledInput label="Anything we should know? (optional)">
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Room preferences, dietary needs, occasion…"
                value={form.specialRequirements}
                onChange={(e) => set("specialRequirements", e.target.value)}
              />
            </LabeledInput>
          </div>

          <div className="mt-7 flex justify-between">
            <Button variant="ghost" onClick={back}>← Back</Button>
            <Button onClick={next}>Continue</Button>
          </div>
        </Card>
      )}

      {/* Step 2 — Review + indicative quote */}
      {step === 2 && (
        <Card className="p-6 sm:p-7">
          <Eyebrow>Review &amp; confirm</Eyebrow>

          <dl className="mt-5 grid gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-2">
            <div className="flex justify-between border-b border-hair py-1.5">
              <dt className="text-muted">Package</dt>
              <dd className="text-right font-medium text-ink-text">{pkg?.title}</dd>
            </div>
            <div className="flex justify-between border-b border-hair py-1.5">
              <dt className="text-muted">Travellers</dt>
              <dd className="text-right font-medium text-ink-text">
                {form.adults} adult{form.adults !== 1 && "s"}
                {form.children > 0 && `, ${form.children} child${form.children !== 1 ? "ren" : ""}`}
              </dd>
            </div>
            <div className="flex justify-between border-b border-hair py-1.5">
              <dt className="text-muted">Date</dt>
              <dd className="text-right font-medium text-ink-text">{form.travelDate || "To confirm"}</dd>
            </div>
            <div className="flex justify-between border-b border-hair py-1.5">
              <dt className="text-muted">Pickup</dt>
              <dd className="text-right font-medium text-ink-text">{form.pickupPoint || "To confirm"}</dd>
            </div>
          </dl>

          {/* Indicative quote */}
          {quote && (
            <div className="mt-6 rounded-xl border border-line bg-paper p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold-dim">
                  Indicative quote
                </span>
                <Badge variant="outline">Estimate</Badge>
              </div>
              <ul className="space-y-1.5 text-[13.5px]">
                {quote.lines.map((l) => (
                  <li key={l.label} className="flex justify-between">
                    <span className="text-ink-text-2">
                      {l.label} · {l.qty} × {formatINR(l.unitPrice)}
                    </span>
                    <span className="font-medium tabular-nums text-ink-text">{formatINR(l.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-hair pt-1.5">
                  <span className="text-ink-text-2">Subtotal</span>
                  <span className="font-medium tabular-nums text-ink-text">{formatINR(quote.subtotal)}</span>
                </li>
                {quote.taxes.map((t) => (
                  <li key={t.label} className="flex justify-between">
                    <span className="text-muted">{t.label}</span>
                    <span className="tabular-nums text-muted">{t.pending ? "—" : formatINR(t.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-hair pt-2 text-[15px]">
                  <span className="font-semibold text-ink-text">Indicative total</span>
                  <span className="font-mono font-bold tabular-nums text-ink-text">{formatINR(quote.total)}</span>
                </li>
              </ul>
              <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
                Indicative only, based on the starting per-person rate. Your team confirms the
                final quote (season, room-sharing, child pricing and GST) before any payment.
              </p>
            </div>
          )}

          {/* Payment-pending notice */}
          <div className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.06] p-4">
            <p className="text-[13px] font-medium text-ink-text">What happens next</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-text-2">
              We&apos;ll confirm availability and share your final quote. Your booking is held as{" "}
              <span className="font-semibold">Payment pending</span> — {PAYMENTS_ENABLED
                ? "you can pay securely online to confirm."
                : "secure online payment is being enabled; until then our team arranges confirmation and payment directly."}
            </p>
          </div>

          <label className="mt-4 flex items-start gap-2.5 text-[13px] text-ink-text-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              Please prepare my booking and contact me to confirm. I agree to the{" "}
              <Link href="/terms-conditions" className="text-gold-dim underline-offset-2 hover:underline">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-gold-dim underline-offset-2 hover:underline">
                privacy policy
              </Link>
              .
            </span>
          </label>

          <div className="mt-7 flex justify-between">
            <Button variant="ghost" onClick={back}>← Back</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Request booking"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
