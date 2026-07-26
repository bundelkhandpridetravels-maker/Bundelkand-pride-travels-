// Server-only: aggregates insights across module providers.
import { HERMES_ENABLED, type HermesInsight, type HermesModule } from "@/lib/hermes/contract";
import { getHermesProvider, hermesProviders } from "@/lib/hermes/providers";

/** What a dashboard receives. `enabled:false` → render the "learning" state. */
export type HermesInsightsResult = {
  enabled: boolean;
  insights: HermesInsight[];
};

/**
 * The single call any dashboard makes. Pass a module for surface-specific
 * insights, or omit for the platform-wide roll-up (Founder). Returns nothing
 * while Hermes is disabled — the seam is ready; wiring a model later is drop-in.
 */
export async function getHermesInsights(module?: HermesModule): Promise<HermesInsightsResult> {
  if (!HERMES_ENABLED) return { enabled: false, insights: [] };

  const providers = module
    ? [getHermesProvider(module)].filter((p): p is NonNullable<typeof p> => Boolean(p))
    : hermesProviders;

  const insights = (await Promise.all(providers.map((p) => p.getInsights()))).flat();
  return { enabled: true, insights };
}
