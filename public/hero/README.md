# Hero background footage

The hero is **video-ready** but ships with a cinematic gradient fallback so it
looks intentional before real footage exists.

## To enable real drone footage

1. Add optimized files here:
   - `hero.webm` (VP9/AV1, ~1080p, 8–15s seamless loop, no audio track)
   - `hero.mp4` (H.264 fallback, same clip)
   - `hero-poster.jpg` (first frame, ~150–250 KB, used as the instant poster)

2. List them in `src/data/destinations.ts`:

   ```ts
   export const heroVideoSources: VideoSource[] = [
     { src: "/hero/hero.webm", type: "video/webm" },
     { src: "/hero/hero.mp4", type: "video/mp4" },
   ];
   ```

That's it — no component changes. `HeroBackground` will autoplay the footage,
and still fall back to the gradient sequence for reduced-motion users, Save-Data
mode, and slow connections.

## Footage guidance

- Keep clips short and loop-friendly; target < 3 MB per file after compression.
- Suggested scenes: Gulmarg, Dal Lake, Kerala backwaters, Solang Valley,
  Goa beaches, Udaipur. Licensed stock or original drone footage only.
