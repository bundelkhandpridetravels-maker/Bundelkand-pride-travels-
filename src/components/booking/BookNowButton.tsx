"use client";

import { useBooking } from "./BookingProvider";
import type { EnquirySource } from "@/lib/enquiry";

type Props = {
  slug?: string;
  title?: string;
  isGroup?: boolean;
  source?: EnquirySource;
  label?: string;
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-gold text-ink hover:-translate-y-0.5",
  outline: "border border-ink/20 text-ink-text hover:bg-ink/5",
  "outline-light": "border border-cream/30 text-cream hover:bg-cream/10",
};

/**
 * Universal booking trigger. Opens the app-wide BookingModal with this package
 * prefilled. Defaults its label to "Reserve your seat" for group departures and
 * "Book now" for private tours.
 */
export default function BookNowButton({
  slug,
  title,
  isGroup,
  source = "package_page",
  label,
  variant = "primary",
  className = "",
}: Props) {
  const { open } = useBooking();
  const text = label ?? (isGroup ? "Reserve your seat" : "Book now");

  return (
    <button
      type="button"
      onClick={() => open({ slug, title, isGroup, source })}
      className={`rounded-lg px-6 py-3.5 text-sm font-bold transition-transform ${variants[variant]} ${className}`}
    >
      {text}
    </button>
  );
}
