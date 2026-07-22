"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const tourLinks = [
  { label: "Packages", href: "/packages" },
  { label: "Group departures", href: "/group-departures" },
  { label: "Corporate tours", href: "/corporate-tours" },
  { label: "School & college", href: "/school-college-tours" },
  { label: "Honeymoon", href: "/honeymoon" },
];

const mainLinks = [
  { label: "Destinations", href: "/destinations" },
  { label: "Reviews", href: "/reviews" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [toursOpen, setToursOpen] = useState(false);
  const toursRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the Tours dropdown on outside click / Escape.
  useEffect(() => {
    if (!toursOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!toursRef.current?.contains(e.target as Node)) setToursOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setToursOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [toursOpen]);

  const linkColor = scrolled
    ? "text-ink-text-2 hover:text-ink-text"
    : "text-cream/80 hover:text-cream";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-hair bg-bone/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Bundelkhand Pride Travels home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-mono text-xs font-bold text-ink">
            BPT
          </span>
          <span className="leading-tight">
            <span className={cn("block text-[13px] font-bold tracking-wide", scrolled ? "text-ink-text" : "text-cream")}>
              Bundelkhand Pride Travels
            </span>
            <span className={cn("block font-mono text-[8.5px] uppercase tracking-[0.16em]", scrolled ? "text-muted" : "text-mist")}>
              Premium travel · across India
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {/* Tours dropdown */}
          <div
            ref={toursRef}
            className="relative"
            onMouseEnter={() => setToursOpen(true)}
            onMouseLeave={() => setToursOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={toursOpen}
              onClick={() => setToursOpen((v) => !v)}
              className={cn("flex items-center gap-1 text-[13px] font-medium transition-colors", linkColor)}
            >
              Tours
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("transition-transform", toursOpen && "rotate-180")}>
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {toursOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-bone shadow-[0_20px_50px_-24px_rgba(10,14,26,0.5)]">
                <ul className="py-1.5">
                  {tourLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setToursOpen(false)}
                        className="block px-4 py-2.5 text-[13px] font-medium text-ink-text-2 transition-colors hover:bg-paper hover:text-ink-text"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {mainLinks.map((l) => (
            <Link key={l.label} href={l.href} className={cn("text-[13px] font-medium transition-colors", linkColor)}>
              {l.label}
            </Link>
          ))}

          <Button href="/packages" variant="primary" size="sm">
            Plan my trip
          </Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={cn("flex h-10 w-10 items-center justify-center rounded-lg lg:hidden", scrolled ? "text-ink-text" : "text-cream")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-hair bg-bone lg:hidden">
          <div className="flex flex-col px-6 py-2">
            <span className="px-1 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Tours
            </span>
            {tourLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-hair/70 py-2.5 pl-2 text-[15px] font-semibold text-ink-text"
              >
                {l.label}
              </Link>
            ))}
            <span className="px-1 pt-4 pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              More
            </span>
            {mainLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-hair/70 py-2.5 pl-2 text-[15px] font-semibold text-ink-text"
              >
                {l.label}
              </Link>
            ))}
            <Button href="/packages" variant="primary" size="lg" className="mt-4 mb-2 w-full" onClick={() => setOpen(false)}>
              Plan my trip
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
