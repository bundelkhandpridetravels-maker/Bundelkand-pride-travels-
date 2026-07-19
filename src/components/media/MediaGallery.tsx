"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CinematicMedia from "@/components/media/CinematicMedia";
import type { CinematicClip } from "@/data/media";

type GalleryItem = { clip: CinematicClip; caption: string };

/**
 * Destination gallery with a full-screen lightbox.
 *
 * Works with whatever media exists: video when a clip is `ready`, poster image
 * next, cinematic gradient last — so the gallery is a real, usable experience
 * today and upgrades itself the moment footage lands.
 *
 * Lightbox is keyboard-driven (←/→/Esc), traps nothing it shouldn't, and
 * restores scroll on close.
 */
export default function MediaGallery({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  if (items.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
        {items.map((item, i) => (
          <li
            key={item.clip.base || item.caption}
            className={i === 0 ? "col-span-2 row-span-2" : ""}
          >
            <button
              onClick={() => setOpen(i)}
              aria-label={`Open ${item.caption} full screen`}
              className={`group relative block w-full overflow-hidden rounded-xl ${
                i === 0 ? "aspect-square lg:aspect-auto lg:h-full" : "aspect-[4/3]"
              }`}
            >
              <CinematicMedia clip={item.clip} overlay={false} />
              <span
                className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent"
                aria-hidden="true"
              />
              <span className="absolute inset-x-0 bottom-0 p-3 text-left font-mono text-[10px] uppercase tracking-[0.1em] text-cream">
                {item.caption}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-ink/60 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"
                    stroke="#EDE7D6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label={items[open].caption}
          >
            <button
              onClick={close}
              aria-label="Close gallery"
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:bg-cream/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <button
              onClick={() => step(-1)}
              aria-label="Previous"
              className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:bg-cream/10"
            >
              ←
            </button>
            <button
              onClick={() => step(1)}
              aria-label="Next"
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:bg-cream/10 sm:right-20"
            >
              →
            </button>

            <motion.figure
              key={open}
              className="relative h-[70vh] w-full max-w-5xl overflow-hidden rounded-2xl"
              initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <CinematicMedia clip={items[open].clip} priority overlay={false} />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-5">
                <p className="font-display text-lg italic text-cream">
                  {items[open].caption}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mist tabular-nums">
                  {open + 1} / {items.length}
                  {!items[open].clip.ready && " · footage coming soon"}
                </p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
