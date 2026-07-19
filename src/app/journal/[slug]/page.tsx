import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { journal } from "@/data/home";
import { journalPosts, type Block } from "@/data/journal-posts";

type Params = { params: Promise<{ slug: string }> };

function getPost(slug: string) {
  const meta = journal.find((p) => p.slug === slug);
  const body = journalPosts[slug];
  if (!meta || !body) return null;
  return { meta, body };
}

export function generateStaticParams() {
  return Object.keys(journalPosts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.meta.title,
    description: post.body.excerpt,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      type: "article",
      title: post.meta.title,
      description: post.body.excerpt,
      publishedTime: post.body.published,
      url: `/journal/${slug}`,
    },
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="mb-3 mt-10 font-display text-2xl font-semibold text-ink-text">
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul key={i} className="mb-5 space-y-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink-text-2">
              <span className="mt-0.5 shrink-0 font-mono text-gold" aria-hidden="true">→</span>
              {item}
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p key={i} className="mb-5 text-[15.5px] leading-[1.75] text-ink-text-2">
          {block.text}
        </p>
      );
  }
}

export default async function JournalPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { meta, body } = post;
  const more = journal.filter((p) => p.slug !== slug && journalPosts[p.slug]).slice(0, 2);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            headline: meta.title,
            description: body.excerpt,
            path: `/journal/${slug}`,
            datePublished: body.published,
            author: body.author,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/journal" },
            { name: meta.title, path: `/journal/${slug}` },
          ]),
        ]}
      />
      <Navbar />
      <main className="flex-1">
        <header className="relative isolate flex min-h-[46vh] items-end overflow-hidden px-6 pb-12 pt-36 text-cream sm:px-10 lg:px-16">
          <div className="absolute inset-0 -z-10" style={{ backgroundImage: meta.gradient }} />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,14,26,0.65) 0%, rgba(10,14,26,0.25) 40%, rgba(10,14,26,0.92) 100%)",
            }}
          />
          <div className="mx-auto w-full max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-5 font-mono text-[11px] uppercase tracking-[0.1em] text-cream/60">
              <Link href="/" className="hover:text-cream">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/journal" className="hover:text-cream">Journal</Link>
            </nav>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold-bright">
              {meta.category}
            </span>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {meta.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-cream/15 pt-4 font-mono text-[11px] text-mist">
              <span>{body.author}</span>
              <span aria-hidden="true">·</span>
              <span>{body.published}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{meta.readMins} min read</span>
            </div>
          </div>
        </header>

        <article className="bg-bone px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-9 border-l-2 border-gold pl-5 font-display text-xl italic leading-relaxed text-ink-text">
              {body.excerpt}
            </p>
            {body.body.map(renderBlock)}

            <div className="mt-14 rounded-2xl border border-line bg-paper p-7 text-center">
              <p className="font-display text-xl italic text-ink-text">
                Planning this trip yourself?
              </p>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-text-2">
                We&apos;ll send you a written itinerary with real inclusions and
                honest pricing — no obligation.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
              >
                Plan my trip
              </Link>
            </div>
          </div>
        </article>

        {more.length > 0 && (
          <section className="bg-paper px-6 py-16 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-dim">
                <span className="h-px w-5 bg-gold-dim" />
                More from the journal
              </h2>
              <ul className="grid gap-5 sm:grid-cols-2">
                {more.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/journal/${p.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bone transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
                    >
                      <div className="h-24" style={{ backgroundImage: p.gradient }} aria-hidden="true" />
                      <div className="p-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold-dim">
                          {p.category}
                        </span>
                        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-ink-text">
                          {p.title}
                        </h3>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
