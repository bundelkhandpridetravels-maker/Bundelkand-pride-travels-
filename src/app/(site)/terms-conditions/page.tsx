import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { company } from "@/data/company";

export const metadata: Metadata = {
  alternates: { canonical: "/terms-conditions" },
  title: "Terms & Conditions",
  description:
    "Booking terms and conditions for Bundelkhand Pride Travels tours and packages.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & conditions" updated="16 July 2026">
      <p>
        These terms apply to trips booked with {company.name}. The specific
        inclusions, exclusions, payment schedule and cancellation terms for your
        trip are confirmed in writing before you pay — those written details take
        precedence over the general summary here.
      </p>

      <h2>Bookings and confirmation</h2>
      <p>
        A booking is confirmed only once we have issued a written confirmation
        and received the agreed payment. Quoted prices are held for the period
        stated in your quote and are subject to availability until confirmed.
      </p>

      <h2>Pricing</h2>
      <ul>
        <li>Prices are quoted per person, per couple or per group as stated, and in Indian Rupees.</li>
        <li>Taxes (including GST) are applied as stated in your quote.</li>
        <li>Inclusions and exclusions are listed in full on every itinerary. Anything not listed as included is excluded.</li>
        <li>Prices may change before confirmation due to supplier rates, fuel costs or government levies. We will always tell you before you commit.</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Payment schedules vary by trip and are set out in your confirmation.
        Card and online payments are processed by our payment provider; we do not
        receive or store your card details.
      </p>

      <h2>Cancellations and changes</h2>
      <p>
        Cancellation charges depend on the trip and how close to departure you
        cancel, because our own supplier commitments vary. The exact schedule is
        given to you in writing at the time of booking. Where we can recover
        costs from suppliers, we pass those recoveries back to you.
      </p>

      <h2>Changes by us</h2>
      <p>
        Occasionally an itinerary must change — weather, road closures, permit
        rules or supplier failure. Where that happens we provide the closest
        reasonable equivalent and tell you as soon as we know. Where a change is
        significant and we cannot offer a suitable alternative, we discuss
        options with you directly.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Provide accurate traveller details, including names as they appear on ID.</li>
        <li>Carry valid identification and any permits your trip requires.</li>
        <li>Tell us in advance about medical conditions, accessibility needs or dietary requirements.</li>
        <li>Follow the reasonable instructions of your trip coordinator, particularly on treks and adventure activities.</li>
      </ul>

      <h2>Travel insurance</h2>
      <p>
        Travel insurance is not included in our packages unless explicitly
        stated. We strongly recommend it, particularly for treks and
        high-altitude trips.
      </p>

      <h2>Liability</h2>
      <p>
        We plan and coordinate your trip and select suppliers with care. Services
        delivered by third parties — hotels, airlines, transport operators and
        activity providers — are also subject to their own terms. We are not
        liable for events outside our reasonable control, including weather,
        natural events, strikes, road closures or government action.
      </p>

      <h2>Contact</h2>
      <p>
        {company.name}, {company.location}. Phone and WhatsApp:{" "}
        <a href={company.phoneHref}>{company.phone}</a>.
      </p>
    </LegalPage>
  );
}
