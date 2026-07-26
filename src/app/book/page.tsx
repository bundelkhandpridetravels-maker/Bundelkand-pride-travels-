import type { Metadata } from "next";
import PageShell, { PageHero } from "@/components/site/PageShell";
import BookingJourney from "@/components/booking/journey/BookingJourney";

export const metadata: Metadata = {
  alternates: { canonical: "/book" },
  title: "Book your trip",
  description:
    "Book your Bundelkhand Pride Travels trip online — choose a package, share your details, and get an indicative quote. Our team confirms availability before payment.",
};

/** Guided online booking journey. `?package=<slug>` prefills the package. */
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const sp = await searchParams;
  const initialPackageSlug = typeof sp.package === "string" ? sp.package : "";

  return (
    <PageShell>
      <PageHero
        eyebrow="Online booking"
        title="Book your trip"
        intro="Three quick steps to request your booking. You'll get an indicative quote now; our team confirms availability and the final price before any payment."
      />
      <section className="bg-bone px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
        <BookingJourney initialPackageSlug={initialPackageSlug} />
      </section>
    </PageShell>
  );
}
