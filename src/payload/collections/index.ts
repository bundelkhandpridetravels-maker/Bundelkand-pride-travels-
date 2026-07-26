import type { CollectionConfig } from "@/payload/types";

import Users from "./Users";
import Customers from "./Customers";
import Vendors from "./Vendors";
import Hotels from "./Hotels";
import Dmcs from "./Dmcs";
import TransportProviders from "./TransportProviders";
import Destinations from "./Destinations";
import Packages from "./Packages";
import Itineraries from "./Itineraries";
import Bookings from "./Bookings";
import Payments from "./Payments";
import Leads from "./Leads";
import CrmActivities from "./CrmActivities";
import Reviews from "./Reviews";
import Influencers from "./Influencers";
import TripCaptains from "./TripCaptains";
import Documents from "./Documents";
import Media from "./Media";
import Contracts from "./Contracts";

/**
 * The full collection set, in a sensible admin order (Access → CRM → Catalogue →
 * Supply → Operations → Finance → Partners → Content → Legal). This array is
 * what gets handed to `buildConfig({ collections })` when the backend is wired.
 */
export const collections: CollectionConfig[] = [
  Users,
  Leads,
  CrmActivities,
  Customers,
  Destinations,
  Packages,
  Itineraries,
  Vendors,
  Hotels,
  Dmcs,
  TransportProviders,
  Bookings,
  Payments,
  Influencers,
  TripCaptains,
  Reviews,
  Media,
  Documents,
  Contracts,
];

export {
  Users,
  Customers,
  Vendors,
  Hotels,
  Dmcs,
  TransportProviders,
  Destinations,
  Packages,
  Itineraries,
  Bookings,
  Payments,
  Leads,
  CrmActivities,
  Reviews,
  Influencers,
  TripCaptains,
  Documents,
  Media,
  Contracts,
};
