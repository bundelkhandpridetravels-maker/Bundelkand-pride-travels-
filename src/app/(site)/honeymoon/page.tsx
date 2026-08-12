import type { Metadata } from "next";
import ScaffoldPage from "@/components/site/ScaffoldPage";

export const metadata: Metadata = {
  alternates: { canonical: "/honeymoon" },
  title: "Honeymoon Packages",
  description:
    "Private, romantic honeymoon journeys curated by Bundelkhand Pride Travels. Section in progress — enquire for a bespoke honeymoon plan.",
};

export default function HoneymoonPage() {
  return (
    <ScaffoldPage
      eyebrow="For Couples"
      title="Honeymoon Packages"
      intro="Private, romantic and flexible-date journeys, curated end to end — the same trusted stays and seamless transfers, planned around the two of you."
      planned={[
        "Private, customisable itinerary",
        "Category-based romantic stays (3★ / 4★ / Premium)",
        "Couple-friendly experiences & transfers",
        "Meal plan & inclusions",
        "Transparent pricing",
        "Gallery & videos",
        "Reviews",
        "Enquiry & bespoke plan request",
      ]}
      noticeTitle="Honeymoon packages are being finalised"
      noticeBody="Real honeymoon itineraries and pricing will be published once confirmed. Tell us your dates, budget and dream destination and we'll craft a bespoke plan."
      ctaLabel="Plan our honeymoon"
    />
  );
}
