"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Eyebrow from "@/components/ui/Eyebrow";
import BookingStatusTimeline from "@/components/booking/BookingStatusTimeline";
import { BOOKING_STATUS_LABELS } from "@/lib/booking/status";
import {
  bookingLookupSchema,
  lookupBooking,
  type BookingLookup,
  type BookingLookupResult,
} from "@/lib/booking/lookup";

const WHATSAPP = "919235121325";
const inputClass =
  "w-full rounded-lg border border-line bg-bone px-3.5 py-2.5 text-[14px] text-ink-text outline-none transition-colors focus:border-gold";

export default function TrackBooking() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof BookingLookup, string>>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingLookupResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const parsed = bookingLookupSchema.safeParse({ reference, phone });
    if (!parsed.success) {
      const errs: Partial<Record<keyof BookingLookup, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (typeof k === "string" && !errs[k as keyof BookingLookup]) {
          errs[k as keyof BookingLookup] = issue.message;
        }
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await lookupBooking(parsed.data);
    setLoading(false);
    setResult(res);
  }

  const waText = encodeURIComponent(
    `Hi, I'd like an update on my booking${reference ? ` (${reference})` : ""}.`,
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* Generic journey explainer */}
      <Card className="p-6 sm:p-7">
        <Eyebrow>How your booking progresses</Eyebrow>
        <BookingStatusTimeline className="mt-6" />
      </Card>

      {/* Lookup */}
      <Card className="mt-6 p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink-text">Find your booking</h2>
        <p className="mt-1 text-[13px] text-ink-text-2">
          Enter the reference from your confirmation (e.g. BPT-7C2C88) and the phone number on the booking.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-text">Booking reference</span>
            <input
              className={inputClass}
              placeholder="BPT-XXXXXX"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            {errors.reference && (
              <span className="mt-1 block text-[12px] font-medium text-red-600" role="alert">
                {errors.reference}
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-text">Phone</span>
            <input
              className={inputClass}
              placeholder="+91…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <span className="mt-1 block text-[12px] font-medium text-red-600" role="alert">
                {errors.phone}
              </span>
            )}
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Checking…" : "Track"}
          </Button>
        </form>
      </Card>

      {/* Result */}
      {result && (
        <Card className="mt-6 p-6 sm:p-7">
          {result.ok && result.found && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Eyebrow>Booking {result.booking.reference}</Eyebrow>
                  {result.booking.packageTitle && (
                    <p className="mt-1 font-display text-lg font-semibold text-ink-text">
                      {result.booking.packageTitle}
                    </p>
                  )}
                </div>
                <Badge variant="gold">{BOOKING_STATUS_LABELS[result.booking.status]}</Badge>
              </div>
              <BookingStatusTimeline status={result.booking.status} className="mt-6" />
            </>
          )}

          {result.ok && !result.found && result.reason === "pending_backend" && (
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-ink-text">
                Online tracking is being connected
              </p>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-text-2">
                Live status tracking activates with our booking system. For an instant update on
                your booking, message us with your reference and we&apos;ll respond right away.
              </p>
              <div className="mt-5">
                <Button href={`https://wa.me/${WHATSAPP}?text=${waText}`} variant="primary">
                  Get an update on WhatsApp
                </Button>
              </div>
            </div>
          )}

          {result.ok && !result.found && result.reason === "not_found" && (
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-ink-text">
                We couldn&apos;t find that booking
              </p>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-text-2">
                Please check the reference and phone number match your confirmation, or contact us.
              </p>
              <div className="mt-5">
                <Button href={`https://wa.me/${WHATSAPP}?text=${waText}`} variant="secondary">
                  Message us
                </Button>
              </div>
            </div>
          )}

          {!result.ok && (
            <p className="text-center text-[13.5px] text-red-600" role="alert">
              {result.error}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
