import Link from "next/link";

const columns = [
  {
    title: "Explore",
    items: [
      { label: "Packages", href: "/packages" },
      { label: "Group departures", href: "/group-departures" },
      { label: "Destinations", href: "/destinations" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Tours",
    items: [
      { label: "Corporate tours", href: "/corporate-tours" },
      { label: "School & college", href: "/school-college-tours" },
      { label: "Honeymoon", href: "/honeymoon" },
      { label: "Reviews", href: "/reviews" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "B2B partners", href: "/b2b" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink-deep text-mist">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10 lg:px-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-mono text-xs font-bold text-ink">
                BPT
              </span>
              <span className="text-[13px] font-bold tracking-wide text-cream">
                Bundelkhand Pride Travels
              </span>
            </div>
            <p className="mt-4 max-w-xs font-display text-base italic text-cream/90">
              Open the World Close to You.
            </p>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed">
              Premium travel experiences across India — curated packages,
              trusted hotels and seamless journeys, planned end to end.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-cream/70">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-[13px]">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-cream transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-cream/70">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <li>
                <a href="tel:+919235121325" className="hover:text-cream transition-colors">
                  +91 92351 21325
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919235121325"
                  className="hover:text-cream transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us
                </a>
              </li>
              <li>Jhansi, Uttar Pradesh · Serving all of India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-cream/10 pt-6 text-[11px] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Bundelkhand Pride Travels</span>
          <span className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-cream transition-colors">
              Privacy
            </Link>
            <Link href="/terms-conditions" className="hover:text-cream transition-colors">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
