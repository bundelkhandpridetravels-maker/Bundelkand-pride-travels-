import type { Metadata } from "next";
import ScaffoldPage from "@/components/site/ScaffoldPage";

export const metadata: Metadata = {
  alternates: { canonical: "/reviews" },
  title: "Reviews",
  description:
    "Verified traveller reviews, photos and videos from Bundelkhand Pride Travels journeys. Section in progress.",
};

export default function ReviewsPage() {
  return (
    <ScaffoldPage
      eyebrow="Traveller Stories"
      title="Reviews"
      intro="Verified reviews, photos and videos from real Bundelkhand Pride Travels journeys — collected after every completed trip."
      planned={[
        "Verified customer reviews",
        "Photo & video reviews",
        "Google review highlights",
        "Ratings by trip type",
        "Share your own experience",
      ]}
      noticeTitle="The reviews hub is being built"
      noticeBody="Real, verified reviews will appear here as trips complete and feedback is collected. Until then, testimonials are featured on the homepage."
      ctaHref="/#reviews"
      ctaLabel="See homepage testimonials"
    />
  );
}
