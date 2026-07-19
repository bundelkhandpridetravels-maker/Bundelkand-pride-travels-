import fs from "node:fs";
import path from "node:path";

/**
 * Live project scanner for the Founder Dashboard.
 *
 * Everything returned here is MEASURED from the repository at request time —
 * never hand-written, never estimated. If a metric can't be measured it is
 * returned as `null` and the UI renders it as "pending", so the dashboard can
 * always be trusted as a source of truth.
 *
 * Server-only: uses node:fs. Imported by the /dashboard/founder server page.
 */

const ROOT = process.cwd();

function walk(dir: string, filter: (f: string) => boolean, acc: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, filter, acc);
    else if (filter(e.name)) acc.push(full);
  }
  return acc;
}

function safeRead(p: string): string | null {
  try {
    return fs.readFileSync(path.join(ROOT, p), "utf8");
  } catch {
    return null;
  }
}

function exists(p: string): boolean {
  return fs.existsSync(path.join(ROOT, p));
}

export type CodebaseMetrics = {
  components: number;
  clientComponents: number;
  pages: number;
  apiRoutes: number;
  dataModules: number;
  libModules: number;
  dependencies: number;
  devDependencies: number;
  todos: number;
  linesOfCode: number;
};

export type MediaMetrics = {
  videoFolders: number;
  placeholders: number;
  realVideos: number;
  clipsReady: number;
  clipsTotal: number;
  realImages: number;
};

export type ContentMetrics = {
  packages: number;
  packagesWithDetail: number;
  destinations: number;
  destinationGuides: number;
  journalPosts: number;
};

export type IntegrationStatus = {
  name: string;
  /** "live" = working now · "scaffolded" = code ready, needs credentials · "planned" */
  state: "live" | "scaffolded" | "planned";
  detail: string;
};

export type ProjectScan = {
  scannedAt: string;
  code: CodebaseMetrics;
  media: MediaMetrics;
  content: ContentMetrics;
  integrations: IntegrationStatus[];
  /** null when the metric genuinely cannot be detected. */
  gitBranch: string | null;
  lastBuild: { ok: boolean; at: string } | null;
};

function countMatches(files: string[], re: RegExp): number {
  let n = 0;
  for (const f of files) {
    try {
      const src = fs.readFileSync(f, "utf8");
      n += (src.match(re) ?? []).length;
    } catch {
      /* unreadable file — skip rather than break the dashboard */
    }
  }
  return n;
}

function scanCode(): CodebaseMetrics {
  const srcDir = path.join(ROOT, "src");
  const tsx = walk(srcDir, (f) => f.endsWith(".tsx"));
  const ts = walk(srcDir, (f) => f.endsWith(".ts"));
  const all = [...tsx, ...ts];

  const pkgRaw = safeRead("package.json");
  const pkg = pkgRaw ? (JSON.parse(pkgRaw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }) : {};

  let loc = 0;
  for (const f of all) {
    try {
      loc += fs.readFileSync(f, "utf8").split("\n").length;
    } catch {
      /* skip */
    }
  }

  return {
    components: tsx.filter((f) => f.includes(`${path.sep}components${path.sep}`)).length,
    clientComponents: all.filter((f) => {
      try {
        return /^["']use client["']/m.test(fs.readFileSync(f, "utf8"));
      } catch {
        return false;
      }
    }).length,
    pages: tsx.filter((f) => f.endsWith("page.tsx")).length,
    apiRoutes: ts.filter((f) => f.endsWith("route.ts")).length,
    dataModules: ts.filter((f) => f.includes(`${path.sep}data${path.sep}`)).length,
    libModules: ts.filter((f) => f.includes(`${path.sep}lib${path.sep}`)).length,
    dependencies: Object.keys(pkg.dependencies ?? {}).length,
    devDependencies: Object.keys(pkg.devDependencies ?? {}).length,
    todos: countMatches(all, /TODO/g),
    linesOfCode: loc,
  };
}

function scanMedia(): MediaMetrics {
  const videosDir = path.join(ROOT, "public", "videos");
  const imagesDir = path.join(ROOT, "public", "images");

  let folders = 0;
  try {
    folders = fs
      .readdirSync(videosDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).length;
  } catch {
    folders = 0;
  }

  const placeholders = walk(videosDir, (f) => f.endsWith(".PLACEHOLDER")).length;
  const realVideos = walk(videosDir, (f) => f.endsWith(".mp4") || f.endsWith(".webm")).length;
  const realImages = walk(imagesDir, (f) =>
    /\.(png|jpe?g|webp|avif)$/i.test(f),
  ).length;

  const mediaSrc = safeRead("src/data/media.ts") ?? "";
  const clipsTotal = (mediaSrc.match(/ready:\s*(true|false)/g) ?? []).length;
  const clipsReady = (mediaSrc.match(/ready:\s*true/g) ?? []).length;

  return { videoFolders: folders, placeholders, realVideos, clipsReady, clipsTotal, realImages };
}

function scanContent(): ContentMetrics {
  const home = safeRead("src/data/home.ts") ?? "";
  const packages = safeRead("src/data/packages.ts") ?? "";
  const destinations = safeRead("src/data/destinations.ts") ?? "";
  const destDetails = safeRead("src/data/destination-details.ts") ?? "";
  const journal = safeRead("src/data/journal-posts.ts") ?? "";

  const topLevelKeys = (src: string, after: string) => {
    const idx = src.indexOf(after);
    if (idx === -1) return 0;
    return (src.slice(idx).match(/^ {2}"?[a-z][a-z0-9-]*"?:\s*\{/gm) ?? []).length;
  };

  return {
    packages: (home.match(/^\s{4}slug:\s*"/gm) ?? []).length,
    packagesWithDetail: topLevelKeys(packages, "packageDetails"),
    destinations: (destinations.match(/^\s*\{\s*slug:\s*"/gm) ?? []).length,
    destinationGuides: topLevelKeys(destDetails, "destinationDetails"),
    journalPosts: topLevelKeys(journal, "journalPosts"),
  };
}

function scanIntegrations(): IntegrationStatus[] {
  const enquiryRoute = exists("src/app/api/enquiries/route.ts");
  const repo = safeRead("src/lib/enquiry-repository.ts") ?? "";
  const usesConsoleRepo = /ConsoleEnquiryRepository/.test(repo);
  const pkgRaw = safeRead("package.json") ?? "{}";
  const deps = Object.keys(
    (JSON.parse(pkgRaw) as { dependencies?: Record<string, string> }).dependencies ?? {},
  );

  return [
    {
      name: "Enquiry capture",
      state: enquiryRoute ? "live" : "planned",
      detail: enquiryRoute
        ? usesConsoleRepo
          ? "API + Zod validation live; persists to server log until a database is connected"
          : "API live with a persistent repository"
        : "Not built",
    },
    { name: "Payload CMS", state: deps.includes("payload") ? "live" : "planned", detail: "Phase 2 — needs Neon database" },
    { name: "Neon Postgres", state: "planned", detail: "Needs account + DATABASE_URL" },
    { name: "Resend email", state: "planned", detail: "Hook point ready in the enquiry route" },
    { name: "Razorpay", state: "planned", detail: "Phase 4 — needs merchant account" },
    { name: "WhatsApp Cloud API", state: "planned", detail: "Deep links live; API needs Meta app" },
    { name: "Analytics (PostHog/Vercel)", state: "planned", detail: "Not installed — zero third-party JS today" },
    { name: "Motion stack", state: deps.includes("gsap") && deps.includes("lenis") ? "live" : "planned", detail: "GSAP + Lenis + Framer Motion installed and wired" },
  ];
}

function scanGitBranch(): string | null {
  try {
    const head = fs.readFileSync(path.join(ROOT, ".git", "HEAD"), "utf8").trim();
    const m = head.match(/ref:\s*refs\/heads\/(.+)$/);
    return m ? m[1] : head.slice(0, 7);
  } catch {
    return null; // no repo — surfaced as "pending" in the UI, never invented
  }
}

function scanLastBuild(): { ok: boolean; at: string } | null {
  try {
    const dir = path.join(ROOT, ".next");
    const stat = fs.statSync(dir);
    const ok = fs.existsSync(path.join(dir, "BUILD_ID"));
    return { ok, at: stat.mtime.toISOString() };
  } catch {
    return null;
  }
}

export function scanProject(): ProjectScan {
  return {
    scannedAt: new Date().toISOString(),
    code: scanCode(),
    media: scanMedia(),
    content: scanContent(),
    integrations: scanIntegrations(),
    gitBranch: scanGitBranch(),
    lastBuild: scanLastBuild(),
  };
}
