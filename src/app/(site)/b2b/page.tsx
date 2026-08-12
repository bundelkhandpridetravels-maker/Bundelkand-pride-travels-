import type { Metadata } from "next";
import ScaffoldPage from "@/components/site/ScaffoldPage";

export const metadata: Metadata = {
  alternates: { canonical: "/b2b" },
  title: "B2B Partner Portal",
  description:
    "A private portal for verified travel-agent partners of Bundelkhand Pride Travels. By invitation — coming soon.",
  robots: { index: false, follow: false },
};

export default function B2BPage() {
  return (
    <ScaffoldPage
      eyebrow="For Travel Agents"
      title="B2B Partner Portal"
      intro="A private booking portal for verified travel-agent partners — no open public registration. Access is by invitation, on the same curated, quality-controlled network."
      planned={[
        "Verified travel-agent login",
        "B2B pricing",
        "Online booking",
        "Commission & wallet",
        "Invoices & GST",
        "Booking history & support",
      ]}
      noticeTitle="The partner portal is a future phase"
      noticeBody="The B2B portal will open to verified agent partners only. If you're an agency interested in partnering, get in touch and we'll add you to the waitlist."
      ctaLabel="Request partner access"
    />
  );
}
