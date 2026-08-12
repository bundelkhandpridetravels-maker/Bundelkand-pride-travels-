import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { company } from "@/data/company";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy-policy" },
  title: "Privacy Policy",
  description:
    "How Bundelkhand Pride Travels collects, uses and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy policy" updated="16 July 2026">
      <p>
        This policy explains what personal information {company.name} collects
        when you enquire about or book a trip, why we collect it, and what we do
        with it. We collect only what we need to plan and run your travel.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Contact details you give us — name, phone/WhatsApp number and email.</li>
        <li>Trip details — destination, travel dates, number of travellers and any preferences or requirements you share.</li>
        <li>Information needed by suppliers — for example names and ID details required by hotels, airlines or transport operators for a specific booking.</li>
        <li>Basic analytics about how the website is used, so we can improve it.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry and prepare an itinerary and quote.</li>
        <li>To make and manage the bookings your trip requires.</li>
        <li>To contact you about your trip before, during and after travel.</li>
        <li>To meet legal, tax and accounting obligations.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share your details with the suppliers a booking requires — hotels,
        transport operators, airlines and local partners — and only the details
        that booking needs. We do not sell your personal information, and we do
        not share it for third-party advertising.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep booking records for as long as we are required to for legal and
        accounting purposes. Enquiries that don&apos;t become bookings are
        archived or removed once they are no longer relevant.
      </p>

      <h2>How we protect it</h2>
      <p>
        The site is served over encrypted connections (HTTPS/TLS). Access to
        customer information is limited to team members who need it for your
        trip, and payment card details are handled entirely by our payment
        provider — we never receive or store full card numbers.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us what personal information we hold about you, ask us to
        correct it, or ask us to delete it where we are not required to keep it.
        Contact us at <a href={company.phoneHref}>{company.phone}</a> and
        we&apos;ll help.
      </p>

      <h2>Contact</h2>
      <p>
        {company.name}, {company.location}. Phone and WhatsApp:{" "}
        <a href={company.phoneHref}>{company.phone}</a>.
      </p>
    </LegalPage>
  );
}
