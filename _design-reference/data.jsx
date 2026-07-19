/* global React */
// ============ Bundelkhand Pride Travels — data + image helpers ============

// LoremFlickr = real free Flickr CC photos by keyword; lock keeps each image stable.
function photo(keywords, seed, w = 900, h = 640) {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}?lock=${seed}`;
}

// Image that always shows the DS warm-gradient placeholder + label underneath,
// and reveals the real photo on top once it loads. Never shows a broken image.
function SmartImg({ keywords, seed, label, w = 900, h = 640, radius = 0, grad, style = {}, className }) {
  const [ok, setOk] = React.useState(true);
  const gradient = grad || 'linear-gradient(135deg, var(--sky-400), var(--yellow-300))';
  return (
    <div className={className} style={{ position: 'absolute', inset: 0, background: gradient, borderRadius: radius, overflow: 'hidden', ...style }}>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: 'var(--tracking-tight)', textShadow: '0 1px 8px rgba(11,32,56,.3)' }}>
          {label}
        </div>
      )}
      {ok && (
        <img src={photo(keywords, seed, w, h)} alt={label || keywords} loading="lazy"
          onError={() => setOk(false)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
    </div>
  );
}

const DEFAULT_INCLUDED = [
  'Hotel accommodation on twin-sharing basis',
  'Daily breakfast and dinner',
  'All sightseeing by private vehicle',
  'Airport / station pick-up and drop',
  'Toll, parking, driver allowance & fuel',
  'On-trip 24×7 travel assistance',
];
const DEFAULT_EXCLUDED = [
  'Airfare / train fare to base city',
  'Lunch and personal expenses',
  'Entry tickets, ropeway & activity charges',
  'Anything not mentioned under inclusions',
];

const DOMESTIC = [
  { id: 'manali', destination: 'Manali', name: 'Manali Volvo group package', kw: 'manali,snow,mountain', seed: 21, duration: '5N / 6D', price: 12999, strike: 15999, bestTime: 'Oct – Feb', rating: 4.8, reviews: 214, seats: 8, badge: 'Best seller', tags: ['Volvo', 'Snow point', 'Solang'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'shimla', destination: 'Shimla', name: 'Shimla & Kufri hill escape', kw: 'shimla,hills,himachal', seed: 32, duration: '4N / 5D', price: 11499, strike: 13999, bestTime: 'Mar – Jun · Dec', rating: 4.7, reviews: 168, seats: 12, tags: ['Toy train', 'Mall Road'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'kashmir', destination: 'Kashmir', name: 'Kashmir valley & Gulmarg', kw: 'kashmir,dal,lake,srinagar', seed: 12, duration: '5N / 6D', price: 18999, strike: 22999, bestTime: 'Mar – Oct · Winter', rating: 4.9, reviews: 302, seats: 6, badge: 'Popular choice', tags: ['Dal Lake', 'Gulmarg', 'Shikara'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'goa', destination: 'Goa', name: 'Goa beaches & nightlife', kw: 'goa,beach,sunset', seed: 44, duration: '3N / 4D', price: 9999, strike: 12499, bestTime: 'Nov – Feb', rating: 4.6, reviews: 251, seats: 14, badge: 'Best seller', tags: ['Beach', 'Cruise', 'Water sports'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'kerala', destination: 'Kerala', name: 'Kerala backwaters & Munnar', kw: 'kerala,backwaters,houseboat', seed: 51, duration: '5N / 6D', price: 21499, strike: 24999, bestTime: 'Sep – Mar', rating: 4.8, reviews: 187, seats: 10, tags: ['Houseboat', 'Tea gardens'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'ooty', destination: 'Ooty', name: 'Ooty queen of hills', kw: 'ooty,tea,garden,hills', seed: 63, duration: '3N / 4D', price: 10999, bestTime: 'Oct – Jun', rating: 4.5, reviews: 132, seats: 16, tags: ['Tea estate', 'Botanical garden'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'coimbatore', destination: 'Coimbatore', name: 'Coimbatore temple & city break', kw: 'coimbatore,temple,india', seed: 71, duration: '2N / 3D', price: 7999, bestTime: 'Oct – Mar', rating: 4.4, reviews: 88, seats: 18, tags: ['Temples', 'Marudhamalai'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'mudumalai', destination: 'Mudumalai', name: 'Mudumalai wildlife safari', kw: 'mudumalai,wildlife,forest,elephant', seed: 82, duration: '2N / 3D', price: 8499, bestTime: 'Oct – May', rating: 4.6, reviews: 74, seats: 9, tags: ['Jeep safari', 'Wildlife'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'pykara', destination: 'Pykara', name: 'Pykara falls & lake day tour', kw: 'pykara,waterfall,lake', seed: 93, duration: '1N / 2D', price: 5999, bestTime: 'Oct – Jun', rating: 4.5, reviews: 61, seats: 20, tags: ['Waterfall', 'Boating'], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
];

const INTL = [
  { id: 'europe', destination: 'Europe', name: 'Best of Europe — 4 countries', kw: 'europe,paris,swiss,alps', seed: 101, duration: '7N / 8D', price: 149999, strike: 179999, bestTime: 'Apr – Sep', rating: 4.9, reviews: 96, badge: 'Popular choice', tags: ['Paris', 'Switzerland', 'Italy'], intl: true, included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'dubai', destination: 'Dubai', name: 'Dubai city & desert luxury', kw: 'dubai,skyline,desert', seed: 112, duration: '4N / 5D', price: 54999, strike: 64999, bestTime: 'Nov – Mar', rating: 4.8, reviews: 143, tags: ['Burj Khalifa', 'Desert safari'], intl: true, included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'bali', destination: 'Bali', name: 'Bali island honeymoon', kw: 'bali,beach,temple', seed: 123, duration: '5N / 6D', price: 64999, strike: 74999, bestTime: 'Apr – Oct', rating: 4.9, reviews: 118, badge: 'Honeymoon', tags: ['Ubud', 'Beach villa'], intl: true, included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'thailand', destination: 'Thailand', name: 'Thailand islands & Bangkok', kw: 'thailand,island,phuket', seed: 134, duration: '4N / 5D', price: 42999, strike: 49999, bestTime: 'Nov – Mar', rating: 4.7, reviews: 176, badge: 'Best seller', tags: ['Phuket', 'Krabi'], intl: true, included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'singapore', destination: 'Singapore', name: 'Singapore family holiday', kw: 'singapore,skyline,marina', seed: 145, duration: '4N / 5D', price: 58999, bestTime: 'Year-round', rating: 4.8, reviews: 121, tags: ['Sentosa', 'Universal'], intl: true, included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
  { id: 'malaysia', destination: 'Malaysia', name: 'Malaysia twin-city tour', kw: 'malaysia,kualalumpur,tower', seed: 156, duration: '4N / 5D', price: 46999, bestTime: 'Year-round', rating: 4.6, reviews: 87, tags: ['Kuala Lumpur', 'Langkawi'], intl: true, included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED },
];

const SPECIAL = [
  {
    id: 'kashmir-ny', destination: 'Kashmir New Year group tour', kw: 'kashmir,snow,winter,gulmarg', seed: 201,
    departs: '2026-12-28T06:00:00', departLabel: 'Departs 28 Dec 2026', duration: '5N / 6D', route: 'Jammu to Jammu',
    price: 13000, badge: 'Limited New Year special', badgeTone: 'energy',
    blurb: 'Ring in 2027 in the snow — Srinagar, Gulmarg gondola, Sonmarg and a New Year houseboat night, all group-managed end to end.',
  },
  {
    id: 'goa-ny', destination: 'Goa New Year package', kw: 'goa,beach,party,night', seed: 202,
    departs: '2026-12-30T12:00:00', departLabel: 'Departs 30 Dec 2026', duration: '3N / 4D', route: 'North & South Goa',
    price: 16000, strike: 26667, badges: ['40% off early booking', 'Honeymoon special'],
    blurb: 'Beachfront stay, sunset cruise and a New Year beach party — book early and save 40% on the couple package.',
  },
];

// Next Friday 07:00, computed live
function nextFriday() {
  const d = new Date();
  const day = d.getDay();
  let add = (5 - day + 7) % 7;
  if (add === 0) add = 7;
  d.setDate(d.getDate() + add);
  d.setHours(7, 0, 0, 0);
  return d;
}

const GROUP_DEPARTURES = [
  { id: 'tungnath', name: 'Tungnath trek', kw: 'tungnath,himalaya,trek', seed: 301, price: 6499, seats: 4, total: 20, meta: 'Chopta base · 3N / 4D' },
  { id: 'chopta', name: 'Chopta trek', kw: 'chopta,meadow,mountain', seed: 302, price: 5999, seats: 7, total: 20, meta: 'Chandrashila summit · 2N / 3D' },
  { id: 'yulakanta', name: 'Yula Kanta trek', kw: 'himalaya,ridge,trek,snow', seed: 303, price: 7499, seats: 9, total: 18, meta: 'Kinnaur ridge · 4N / 5D' },
  { id: 'churdhar', name: 'Churdhar trek', kw: 'churdhar,himachal,peak', seed: 304, price: 6999, seats: 11, total: 20, meta: 'Sirmaur · 2N / 3D' },
  { id: 'kedarnath', name: 'Kedarnath group tour', kw: 'kedarnath,temple,himalaya', seed: 305, price: 9999, seats: 5, total: 24, meta: 'Guptkashi base · 4N / 5D' },
  { id: 'manali-grp', name: 'Manali group tour', kw: 'manali,snow,valley', seed: 306, price: 8499, seats: 13, total: 26, meta: 'Volvo · 5N / 6D' },
];

const TREKS = [
  { id: 't1', name: 'Tungnath – Chandrashila', kw: 'tungnath,himalaya,snow', seed: 311, altitude: '3,680 m', difficulty: 'Easy–Moderate', fitness: 'Beginner-friendly', score: 6, price: 6499 },
  { id: 't2', name: 'Chopta meadows', kw: 'chopta,meadow,pine', seed: 312, altitude: '2,680 m', difficulty: 'Easy', fitness: 'Any fitness level', score: 5, price: 5999 },
  { id: 't3', name: 'Yula Kanta ridge', kw: 'kinnaur,himalaya,ridge', seed: 313, altitude: '3,700 m', difficulty: 'Moderate', fitness: 'Regular walkers', score: 7, price: 7499 },
  { id: 't4', name: 'Churdhar peak', kw: 'churdhar,peak,snow', seed: 314, altitude: '3,647 m', difficulty: 'Moderate', fitness: 'Regular walkers', score: 7, price: 6999 },
  { id: 't5', name: 'Kedarkantha summit', kw: 'kedarkantha,snow,trek', seed: 315, altitude: '3,810 m', difficulty: 'Moderate', fitness: 'Basic cardio', score: 8, price: 8999 },
  { id: 't6', name: 'Brahmatal winter trek', kw: 'brahmatal,snow,himalaya', seed: 316, altitude: '3,734 m', difficulty: 'Moderate', fitness: 'Basic cardio', score: 8, price: 9499 },
];

const GUIDES = [
  { icon: 'ph-mountains', title: 'Mountain packing list', desc: 'Layering, footwear and gear for high-altitude treks.', read: '5 min' },
  { icon: 'ph-airplane-tilt', title: 'International trip prep', desc: 'Documents, currency and connectivity before you fly.', read: '6 min' },
  { icon: 'ph-identification-card', title: 'Passport checklist', desc: 'Validity, blank pages and renewal timelines.', read: '3 min' },
  { icon: 'ph-stamp', title: 'Visa guide', desc: 'Tourist visa steps for Dubai, Thailand, Europe & more.', read: '7 min' },
  { icon: 'ph-shield-check', title: 'Travel insurance', desc: 'What to cover and how claims actually work.', read: '4 min' },
  { icon: 'ph-snowflake', title: 'Winter packing', desc: 'Staying warm in Kashmir, Manali and snow treks.', read: '4 min' },
  { icon: 'ph-sun', title: 'Summer packing', desc: 'Light, breathable kit for beaches and city tours.', read: '3 min' },
  { icon: 'ph-cloud-rain', title: 'Monsoon packing', desc: 'Waterproofing for Kerala, Goa and the Western Ghats.', read: '3 min' },
  { icon: 'ph-first-aid-kit', title: 'Medicine checklist', desc: 'A simple travel first-aid kit for any trip.', read: '4 min' },
  { icon: 'ph-calendar-check', title: 'Best time to visit', desc: 'Season-by-season guide to every destination.', read: '6 min' },
  { icon: 'ph-users-three', title: 'Family travel tips', desc: 'Travelling comfortably with kids and elders.', read: '5 min' },
  { icon: 'ph-question', title: 'Booking FAQ', desc: 'Advance, payments, changes and cancellations.', read: '4 min' },
];

const TESTIMONIALS = [
  { name: 'Ananya & Rohit Sharma', trip: 'Kashmir valley · Mar 2026', stars: 5, quote: 'From the Dal Lake houseboat to the Gulmarg gondola, everything was planned to the minute. We only had to enjoy it.' },
  { name: 'Vikram Nair', trip: 'Manali Volvo group · Jan 2026', stars: 5, quote: 'Great Volvo, clean hotels and a driver who knew every viewpoint. The ₹3,000 advance made booking stress-free.' },
  { name: 'Priya Deshmukh', trip: 'Kerala backwaters · Dec 2025', stars: 5, quote: 'The houseboat and Munnar tea gardens were dreamy. 24×7 support answered even at midnight. Fully recommend.' },
];

const GALLERY = [
  { kw: 'kashmir,shikara,lake', seed: 401 }, { kw: 'manali,snow,valley', seed: 402 },
  { kw: 'goa,beach,palm', seed: 403 }, { kw: 'kerala,houseboat,backwater', seed: 404 },
  { kw: 'himalaya,trek,tent', seed: 405 }, { kw: 'rajasthan,desert,fort', seed: 406 },
];

const TRUST = [
  { icon: 'ph-seal-check', title: 'Verified business', desc: 'Registered travel company based in Jhansi, UP.' },
  { icon: 'ph-headset', title: '24×7 trip assistance', desc: 'Real support before, during and after your trip.' },
  { icon: 'ph-lock-key', title: 'Secure booking', desc: 'Book with ₹3,000 advance, pay the rest before departure.' },
  { icon: 'ph-credit-card', title: 'Trusted payments', desc: 'UPI, cards and net-banking via secure gateways.' },
];

const STATS = [
  { value: 3, suffix: '+', label: 'years of experience', icon: 'ph-calendar-heart' },
  { value: 9000, suffix: '+', label: 'happy travellers', icon: 'ph-users-three' },
  { value: 1000, suffix: '+', label: 'tours planned', icon: 'ph-map-trifold' },
  { value: 20, suffix: '+', label: 'destinations', icon: 'ph-map-pin-line' },
];

const CONTACT = {
  founder: 'Shivendra Pratap Singh', role: 'Founder & Managing Director',
  address: 'Below Duke Hotel, Elite Circle, Jhansi, Uttar Pradesh, India',
  phone: '+91 92351 21325', phoneRaw: '919235121325',
  hours: 'Monday – Saturday · 9:00 AM – 8:00 PM', support: '24×7 trip assistance during active tours',
  email: 'hello@bundelkhandpride.travel',
};

const NAV = ['Packages', 'Special offers', 'Group departures', 'Treks', 'Guides', 'Contact'];

window.BPT = {
  photo, DOMESTIC, INTL, SPECIAL, GROUP_DEPARTURES, TREKS, GUIDES,
  TESTIMONIALS, GALLERY, TRUST, STATS, CONTACT, NAV, nextFriday,
};
window.SmartImg = SmartImg;
