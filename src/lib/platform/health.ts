// Server-only: computes real platform health from the registry.
import {
  platformModules,
  type PlatformLayer,
  type PlatformModuleId,
} from "@/lib/platform/registry";

export type ModuleReadiness = "operational" | "provider_pending" | "credential_pending";

export type ModuleHealth = {
  id: PlatformModuleId;
  label: string;
  layer: PlatformLayer;
  live: boolean;
  provider: string;
  readiness: ModuleReadiness;
  missingEnv: string[];
  presentEnv: string[];
};

export type PlatformHealth = {
  modules: ModuleHealth[];
  summary: {
    total: number;
    operational: number;
    providerPending: number;
    credentialPending: number;
  };
};

/** Presence-only env check — reads whether a var is set, never its value. */
function envStatus(keys: string[]): { present: string[]; missing: string[] } {
  const present: string[] = [];
  const missing: string[] = [];
  for (const k of keys) {
    if (process.env[k] && String(process.env[k]).length > 0) present.push(k);
    else missing.push(k);
  }
  return { present, missing };
}

export async function getPlatformHealth(): Promise<PlatformHealth> {
  const modules: ModuleHealth[] = await Promise.all(
    platformModules.map(async (m) => {
      const live = await m.checkLive();
      const { present, missing } = envStatus(m.requiredEnv);
      const readiness: ModuleReadiness = live
        ? "operational"
        : missing.length > 0
          ? "credential_pending"
          : "provider_pending";
      return {
        id: m.id,
        label: m.label,
        layer: m.layer,
        live,
        provider: m.provider,
        readiness,
        missingEnv: missing,
        presentEnv: present,
      };
    }),
  );

  const summary = {
    total: modules.length,
    operational: modules.filter((m) => m.readiness === "operational").length,
    providerPending: modules.filter((m) => m.readiness === "provider_pending").length,
    credentialPending: modules.filter((m) => m.readiness === "credential_pending").length,
  };

  return { modules, summary };
}
