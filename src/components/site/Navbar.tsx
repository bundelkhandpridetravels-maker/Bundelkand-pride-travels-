"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Group Trips", href: "/group-departures" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-hair bg-bone/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Bundelkhand Pride Travels home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-mono text-xs font-bold text-ink">
            BPT
          </span>
          <span className="leading-tight">
            <span
              className={`block text-[13px] font-bold tracking-wide ${
                scrolled ? "text-ink-text" : "text-cream"
              }`}
            >
              Bundelkhand Pride Travels
            </span>
            <span
              className={`block font-mono text-[8.5px] uppercase tracking-[0.16em] ${
                scrolled ? "text-muted" : "text-mist"
              }`}
            >
              Premium travel · across India
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`text-[13px] font-medium transition-colors ${
                scrolled
                  ? "text-ink-text-2 hover:text-ink-text"
                  : "text-cream/80 hover:text-cream"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/packages"
            className="rounded-lg bg-gold px-4 py-2 text-[12.5px] font-bold text-ink transition-transform hover:-translate-y-0.5"
          >
            Plan my trip
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={`flex h-10 w-10 items-center justify-center rounded-lg lg:hidden ${
            scrolled ? "text-ink-text" : "text-cream"
          }`}
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
        <div className="border-t border-hair bg-bone lg:hidden">
          <div className="flex flex-col px-6 py-2">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-hair/70 py-3 text-[15px] font-semibold text-ink-text"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/packages"
              onClick={() => setOpen(false)}
              className="mt-3 mb-2 rounded-lg bg-gold py-3 text-center text-sm font-bold text-ink"
            >
              Plan my trip
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
