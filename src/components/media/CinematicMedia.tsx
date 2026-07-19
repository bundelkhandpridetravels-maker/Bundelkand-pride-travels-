"use client";

import { useEffect, useRef, useState } from "react";
import { clipSources, type CinematicClip } from "@/data/media";

/**
 * The one media surface used for every cinematic frame on the site.
 *
 * Resolution order — always honest, never a fake player:
 *   1. Looping muted video, when the clip is marked `ready` AND the visitor's
 *      connection/preferences allow it (reduced-motion, Save-Data, 2G opt out).
 *   2. Poster photograph.
 *   3. Cinematic gradient.
 *
 * Video only decodes while on screen: it pauses when scrolled away or the tab
 * is hidden, which keeps a page full of clips from melting a mid-range phone.
 */
export default function CinematicMedia({
  clip,
  className = "",
  priority = false,
  overlay = true,
}: {
  clip: CinematicClip;
  className?: string;
  priority?: boolean;
  overlay?: boolean;
}) {
  const sources = clipSources(clip);
  const hasVideo = sources.length > 0;
  const [playVideo, setPlayVideo] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!hasVideo) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const slow = conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
    // Client-only capability probe (matchMedia + navigator.connection); it can
    // only run after mount, so the state update genuinely belongs in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!reduced && conn?.saveData !== true && !slow) setPlayVideo(true);
  }, [hasVideo]);

  // Pause off-screen / hidden so many clips on one page stay cheap.
  useEffect(() => {
    if (!playVideo) return;
    const el = wrapRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const sync = (visible: boolean) => {
      if (visible && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    };
    const io = new IntersectionObserver(([e]) => sync(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    const onVis = () => sync(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [playVideo]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {playVideo && hasVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster={clip.poster}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          onError={() => setPlayVideo(false)}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      ) : clip.poster && clip.ready ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={clip.poster}
          alt=""
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: clip.gradient }}
          aria-hidden="true"
        />
      )}

      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,14,26,0.55) 0%, rgba(10,14,26,0.15) 40%, rgba(10,14,26,0.85) 100%)",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
