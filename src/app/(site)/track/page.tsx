import type { Metadata } from "next";
import PageShell, { PageHero } from "@/components/site/PageShell";
import TrackBooking from "@/components/booking/journey/TrackBooking";

export const metadata: Metadata = {
  alternates: { canonical: "/track" },
  title: "Track your booking",
  description:
    "Track your Bundelkhand Pride Travels booking with your reference number and phone.",
  robots: { index: false, follow: false },
};

/** Customer booking-tracking page. */
export default function TrackPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Your trip"
        title="Track your booking"
        intro="See where your booking is in the journey — from quote to confirmed to completed."
      />
      <section className="bg-bone px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
        <TrackBooking />
      </section>
    </PageShell>
  );
}
