"use client";

import { useEffect, useRef } from "react";
import type { Atmosphere } from "@/data/destinations";

/**
 * Live weather layer over the hero — snow in the mountains, monsoon rain in
 * Kerala, warm dust-haze over the desert, plus an aircraft that periodically
 * arcs across the sky with a contrail.
 *
 * Deliberately canvas + a single rAF loop instead of video:
 *  - a few KB of JS vs. megabytes of footage (this audience is on mobile data)
 *  - crossfades between moods as the hero scene rotates, which video can't do
 *  - renders nothing at all under `prefers-reduced-motion`
 *  - pauses entirely when the tab is hidden or the hero scrolls out of view
 */

type Particle = { x: number; y: number; r: number; vx: number; vy: number; a: number };

const PLANE_PERIOD_MS = 19000; // one flyover every ~19s
const PLANE_DURATION_MS = 7000;

export default function HeroAtmosphere({ atmosphere }: { atmosphere: Atmosphere }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep the latest mood in a ref so the animation loop never restarts on change.
  const moodRef = useRef<Atmosphere>(atmosphere);

  useEffect(() => {
    moodRef.current = atmosphere;
  }, [atmosphere]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let running = true;
    let last = performance.now();
    const startedAt = performance.now();
    // Blend factor between moods so weather crossfades rather than snapping.
    let shown: Atmosphere = moodRef.current;
    let blend = 1;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;

    function countFor(mood: Atmosphere) {
      const area = (w * h) / (1280 * 720);
      const base = mood === "rain" ? 150 : mood === "snow" ? 110 : 55;
      return Math.round(Math.min(base, base * area) * (isCoarse ? 0.5 : 1));
    }

    function spawn(mood: Atmosphere): Particle {
      if (mood === "rain") {
        return {
          x: Math.random() * w,
          y: Math.random() * -h,
          r: 0.7 + Math.random() * 0.7,
          vx: 40 + Math.random() * 30,
          vy: 900 + Math.random() * 500,
          a: 0.18 + Math.random() * 0.3,
        };
      }
      if (mood === "snow") {
        return {
          x: Math.random() * w,
          y: Math.random() * -h,
          r: 1 + Math.random() * 2.1,
          vx: -14 + Math.random() * 28,
          vy: 26 + Math.random() * 42,
          a: 0.32 + Math.random() * 0.5,
        };
      }
      // sun / mist — slow drifting motes of warm dust
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 1.8,
        vx: 7 + Math.random() * 16,
        vy: -5 + Math.random() * 10,
        a: 0.12 + Math.random() * 0.26,
      };
    }

    function rebuild(mood: Atmosphere) {
      particles = Array.from({ length: countFor(mood) }, () => spawn(mood));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild(shown);
    }

    function drawPlane(elapsed: number) {
      const phase = elapsed % PLANE_PERIOD_MS;
      if (phase > PLANE_DURATION_MS) return;
      const t = phase / PLANE_DURATION_MS; // 0 → 1 across the sky
      const x = -80 + t * (w + 160);
      const y = h * 0.26 - t * h * 0.1; // gentle climb
      // fade in and out at the edges
      const alpha = Math.sin(Math.PI * t) * 0.5;
      if (alpha <= 0.01) return;

      ctx!.save();
      ctx!.globalAlpha = alpha;

      // contrail
      const grad = ctx!.createLinearGradient(x - 150, y, x, y);
      grad.addColorStop(0, "rgba(237,231,214,0)");
      grad.addColorStop(1, "rgba(237,231,214,0.5)");
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 1.6;
      ctx!.beginPath();
      ctx!.moveTo(x - 150, y + 5);
      ctx!.lineTo(x, y);
      ctx!.stroke();

      // aircraft silhouette
      ctx!.fillStyle = "rgba(237,231,214,0.92)";
      ctx!.beginPath();
      ctx!.moveTo(x, y);
      ctx!.lineTo(x - 11, y + 3.4);
      ctx!.lineTo(x - 8, y);
      ctx!.lineTo(x - 11, y - 3.4);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Crossfade when the scene's mood changes.
      if (moodRef.current !== shown) {
        blend -= dt * 1.6;
        if (blend <= 0) {
          shown = moodRef.current;
          rebuild(shown);
          blend = 0;
        }
      } else if (blend < 1) {
        blend = Math.min(1, blend + dt * 1.6);
      }

      ctx!.clearRect(0, 0, w, h);
      const mood = shown;

      // Warm light bloom for desert/beach sunsets.
      if (mood === "sun") {
        const g = ctx!.createRadialGradient(w * 0.76, h * 0.3, 0, w * 0.76, h * 0.3, Math.max(w, h) * 0.55);
        g.addColorStop(0, `rgba(255,196,110,${0.15 * blend})`);
        g.addColorStop(1, "rgba(255,196,110,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, w, h);
      }

      ctx!.save();
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y > h + 12 || p.x > w + 12 || p.x < -12) {
          Object.assign(p, spawn(mood));
          if (mood !== "sun" && mood !== "mist") p.y = -12;
        }
        ctx!.globalAlpha = p.a * blend;
        if (mood === "rain") {
          ctx!.strokeStyle = "rgba(200,225,255,0.85)";
          ctx!.lineWidth = p.r;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x - p.vx * 0.016, p.y - p.vy * 0.016);
          ctx!.stroke();
        } else {
          ctx!.fillStyle = mood === "snow" ? "rgba(255,255,255,0.95)" : "rgba(255,214,150,0.9)";
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      ctx!.restore();

      drawPlane(now - startedAt);
      raf = requestAnimationFrame(frame);
    }

    // Only animate while the hero is actually on screen and the tab is visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        const shouldRun = entry.isIntersecting && !document.hidden;
        if (shouldRun && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!shouldRun) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.01 },
    );

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    io.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
