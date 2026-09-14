import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Next 16 builds with Turbopack by default. Declaring the (empty) property
  // silences Payload's configuration warning without changing behaviour.
  turbopack: {},

  /**
   * Ship sharp's native binaries with the server bundles.
   *
   * `payload.config.ts` imports `sharp`, so every route that imports
   * `@payload-config` — /admin and /payload-api — needs it at runtime. Payload's
   * own `withPayload` already marks sharp as an external package, which means it
   * is copied from node_modules rather than bundled, and what gets copied is
   * decided by Next's static file tracing.
   *
   * Tracing cannot see everything sharp needs. `@img/sharp-linux-x64` reaches
   * `libvips-cpp.so` through a runtime dlopen, not an import, so the addon was
   * copied to Vercel and its shared library was not:
   *
   *   ERR_DLOPEN_FAILED: libvips-cpp.so.8.18.3: cannot open shared object file
   *
   * Naming the whole `@img` scope here forces both halves in. The `**\/*` key is
   * the one withPayload itself uses for `@libsql/client`, and it merges by
   * appending — so both entries survive. A route-specific key would be fragile
   * against route groups and optional catch-alls, and a key that fails to match
   * fails silently, which is exactly how this bug reached production preview.
   */
  outputFileTracingIncludes: {
    "**/*": ["./node_modules/@img/**"],
  },
};

export default withPayload(nextConfig);
