import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { journal } from "@/data/home";
import { journalPosts } from "@/data/journal-posts";

export const metadata: Metadata = {
  alternates: { canonical: "/journal" },
  title: "Journal",
  description:
    "Practical travel guides written by the coordinators who actually run our trips — destination timing, packing lists and planning checklists.",
};

export default function JournalPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <header className="relative isolate bg-ink px-6 pb-14 pt-36 text-cream sm:px-10 lg:px-16">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 70% 20%, rgba(201,162,77,0.14), transparent 55%)",
            }}
          />
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              <span className="h-px w-5 bg-gold" />
              Journal
            </div>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Guides from the road
            </h1>
            <p className="mt-4 max-w-xl text-cream/70">
              Written by the coordinators who run these trips — not repackaged
              from someone else&apos;s blog.
            </p>
          </div>
        </header>

        <section className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {journal.map((post) => {
                const body = journalPosts[post.slug];
                const hasPost = Boolean(body);
                return (
                  <li key={post.slug}>
                    <Link
                      href={hasPost ? `/journal/${post.slug}` : "/journal"}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <div
                          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: post.gradient }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold-dim">
                          {post.category}
                        </span>
                        <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-ink-text">
                          {post.title}
                        </h2>
                        {body && (
                          <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-text-2">
                            {body.excerpt}
                          </p>
                        )}
                        <span className="mt-4 flex items-center justify-between border-t border-hair pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                          <span className="tabular-nums">{post.readMins} min read</span>
                          <span className="text-gold-dim">Read →</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
