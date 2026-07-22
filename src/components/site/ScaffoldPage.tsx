import Link from "next/link";
import PageShell, { PageHero } from "@/components/site/PageShell";
import { Section } from "@/components/site/Section";
import ScaffoldNotice from "@/components/site/ScaffoldNotice";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

/**
 * Reusable scaffold page for blueprint sections whose real content is pending
 * founder data (Corporate, School & College, Honeymoon, Reviews, B2B).
 *
 * It shows the intended *structure* only (the blueprint's package/section
 * fields) plus a loud ScaffoldNotice and an enquiry CTA. It deliberately invents
 * no destinations, hotels, itineraries, prices or claims.
 */
export default function ScaffoldPage({
  eyebrow,
  title,
  intro,
  planned,
  noticeTitle,
  noticeBody,
  ctaHref = "/contact",
  ctaLabel = "Enquire about this",
}: {
  eyebrow: string;
  title: string;
  intro: string;
  planned: string[];
  noticeTitle: string;
  noticeBody: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <PageShell>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />

      <Section tone="bone">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold-dim">
            What this section will include
          </p>
        </Reveal>

        <StaggerGroup className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planned.map((label) => (
            <StaggerItem key={label}>
              <Card className="h-full p-5">
                <span className="font-display text-base font-semibold text-ink-text">
                  {label}
                </span>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-10">
          <ScaffoldNotice title={noticeTitle}>
            <p>{noticeBody}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={ctaHref} variant="primary" size="md">
                {ctaLabel}
              </Button>
              <Button href="/packages" variant="secondary" size="md">
                Browse current packages
              </Button>
            </div>
          </ScaffoldNotice>
        </div>

        <p className="mt-8 text-[13px] text-muted">
          Looking for something now?{" "}
          <Link href="/contact" className="text-gold-dim underline-offset-2 hover:underline">
            Talk to our team
          </Link>
          .
        </p>
      </Section>
    </PageShell>
  );
}
