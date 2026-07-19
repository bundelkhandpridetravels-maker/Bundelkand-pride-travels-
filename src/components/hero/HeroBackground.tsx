"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroScene, VideoSource } from "@/data/destinations";
import HeroAtmosphere from "./HeroAtmosphere";

/** Must match the `scene-fade` cycle in globals.css (36s across all scenes). */
const SCENE_CYCLE_MS = 36000;

type Props = {
  scenes: HeroScene[];
  videoSources?: VideoSource[];
  poster?: string;
};

/**
 * Video-ready cinematic background.
 * - Plays looping muted footage when sources are supplied AND the connection /
 *   user preferences allow it (respects reduced-motion, Save-Data, slow links).
 * - Otherwise falls back to a crossfading Ken Burns sequence of the destination
 *   gradients, so it always looks intentional — never a blank/black box.
 */
export default function HeroBackground({ scenes, videoSources = [], poster }: Props) {
  const hasVideo = videoSources.length > 0;
  const [playVideo, setPlayVideo] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track which scene is showing so the weather layer matches it (snow over
  // Gulmarg, monsoon rain over Kerala, warm haze over the dunes). Timed to the
  // same cycle the CSS crossfade uses.
  useEffect(() => {
    if (scenes.length < 2) return;
    const per = SCENE_CYCLE_MS / scenes.length;
    const id = window.setInterval(
      () => setSceneIndex((i) => (i + 1) % scenes.length),
      per,
    );
    return () => window.clearInterval(id);
  }, [scenes.length]);

  useEffect(() => {
    if (!hasVideo) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Best-effort data-saver / slow-connection detection.
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const saveData = conn?.saveData === true;
    const slow =
      conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";

    // Client-only decision from navigator.connection / matchMedia; effect-bound.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!prefersReduced && !saveData && !slow) setPlayVideo(true);
  }, [hasVideo]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink" aria-hidden="true">
      {playVideo && hasVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          onError={() => setPlayVideo(false)}
        >
          {videoSources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      ) : (
        <div className="absolute inset-0">
          {scenes.map((scene, i) => (
            <div
              key={scene.id}
              className="bpt-scene"
              style={{ animationDelay: `${(i * 36) / scenes.length}s` }}
            >
              <div
                className="bpt-scene-img"
                style={{ backgroundImage: scene.gradient }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Live weather + aircraft flyover, matched to the visible scene */}
      <HeroAtmosphere atmosphere={scenes[sceneIndex]?.atmosphere ?? "mist"} />

      {/* Readability gradient — kept subtle so the footage stays beautiful */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.34) 34%, rgba(10,14,26,0.55) 74%, rgba(10,14,26,0.92) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 74% 26%, rgba(201,162,77,0.12), transparent 56%)",
        }}
      />
    </div>
  );
}
