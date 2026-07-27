import type { Metadata } from "next";
import PageShell, { PageHero } from "@/components/site/PageShell";
import ReviewForm from "@/components/reviews/ReviewForm";

export const metadata: Metadata = {
  alternates: { canonical: "/reviews/submit" },
  title: "Write a review",
  description: "Share your experience travelling with Bundelkhand Pride Travels.",
};

/** Public review submission. `?package=<slug>` / `?ref=<booking>` prefill context. */
export default async function SubmitReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; ref?: string }>;
}) {
  const sp = await searchParams;
  const packageSlug = typeof sp.package === "string" ? sp.package : "";
  const bookingReference = typeof sp.ref === "string" ? sp.ref : "";

  return (
    <PageShell>
      <PageHero
        eyebrow="Traveller stories"
        title="Write a review"
        intro="Travelled with us? We'd love to hear about it — your review helps other travellers plan with confidence."
      />
      <section className="bg-bone px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
        <ReviewForm packageSlug={packageSlug} bookingReference={bookingReference} />
      </section>
    </PageShell>
  );
}
