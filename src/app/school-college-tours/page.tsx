import type { Metadata } from "next";
import ScaffoldPage from "@/components/site/ScaffoldPage";

export const metadata: Metadata = {
  alternates: { canonical: "/school-college-tours" },
  title: "School & College Tours",
  description:
    "Supervised, safety-first educational and adventure tours for schools and colleges by Bundelkhand Pride Travels. Section in progress — enquire for a group plan.",
};

export default function SchoolCollegeToursPage() {
  return (
    <ScaffoldPage
      eyebrow="For Schools & Colleges"
      title="School & College Tours"
      intro="Supervised, safety-first educational and adventure tours for student groups, with dedicated coordinators and verified transport and stays."
      planned={[
        "Age-appropriate day-wise itinerary",
        "Category-based group accommodation",
        "Verified transport with coordinators",
        "Student-safety measures & FAQ",
        "Per-student group pricing",
        "Inclusions & exclusions",
        "Gallery & references",
        "Enquiry & custom plan request",
      ]}
      noticeTitle="Student-tour packages are being finalised"
      noticeBody="Real itineraries, safety details and per-student pricing will be published once confirmed. Share your group size, class/level, dates and preferred destination for a tailored plan."
      ctaLabel="Request a student-group plan"
    />
  );
}
