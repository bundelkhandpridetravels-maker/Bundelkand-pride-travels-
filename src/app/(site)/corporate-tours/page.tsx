import type { Metadata } from "next";
import ScaffoldPage from "@/components/site/ScaffoldPage";

export const metadata: Metadata = {
  alternates: { canonical: "/corporate-tours" },
  title: "Corporate Tours",
  description:
    "Corporate travel, offsites and MICE planned end to end by Bundelkhand Pride Travels. Section in progress — enquire for a custom proposal.",
};

export default function CorporateToursPage() {
  return (
    <ScaffoldPage
      eyebrow="For Teams & Companies"
      title="Corporate Tours"
      intro="Offsites, incentive trips, conferences and team retreats — planned end to end by a dedicated coordinator, on the same curated, verified-vendor model as the rest of our trips."
      planned={[
        "Custom day-wise itinerary",
        "Category-based hotels (3★ / 4★ / Premium)",
        "Transport, transfers & on-ground coordination",
        "Inclusions & exclusions",
        "Group pricing & GST invoicing",
        "Gallery & past-trip references",
        "Policies & FAQ",
        "Enquiry & proposal request",
      ]}
      noticeTitle="Corporate packages are being finalised"
      noticeBody="Real corporate itineraries and pricing will be published once confirmed. In the meantime, share your team size, dates and destination and we'll prepare a tailored proposal."
      ctaLabel="Request a corporate proposal"
    />
  );
}
