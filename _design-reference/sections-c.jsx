/* global React, Section, SectionHead, SmartImg, Reveal */
// ============ Cab recommender + Trekking + Guides + Trust + Contact + Footer ============
const { useState: cState } = React;

// ---------- Personal tours + smart cab recommender ----------
const CABS = [
  { min: 1, max: 3, name: 'Alto', icon: 'ph-car', note: 'Compact hatchback', cap: '3 seats + luggage' },
  { min: 4, max: 4, name: 'Dzire / Sedan', icon: 'ph-car-profile', note: 'Comfort sedan', cap: '4 seats + boot' },
  { min: 5, max: 6, name: 'SUV', icon: 'ph-jeep', note: 'Ertiga / Innova', cap: '6 seats + luggage' },
  { min: 7, max: 12, name: 'Tempo Traveller', icon: 'ph-van', note: 'Group comfort', cap: '12 seats + carrier' },
  { min: 13, max: 20, name: 'Mini Bus', icon: 'ph-bus', note: 'Large group', cap: '20+ seats' },
];

function CabRecommender({ api }) {
  const [pax, setPax] = cState(4);
  const rec = CABS.find((c) => pax >= c.min && pax <= c.max) || CABS[CABS.length - 1];
  return (
    <Section id="personal-tours" style={{ background: 'var(--surface-page)' }}>
      <SectionHead eyebrow="Personal & private tours" title="Your own cab, sized to your group" sub="Family trips, couple getaways, the Manali Volvo package or a private cab tour — tell us how many are travelling and we'll match the right vehicle." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }} className="bpt-cab-grid">
        <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', padding: 'clamp(24px,3vw,36px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <label htmlFor="pax" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--ink-900)' }}>Travellers</label>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}>{pax}</span>
          </div>
          <input id="pax" type="range" min="1" max="20" value={pax} onChange={(e) => setPax(+e.target.value)} className="bpt-range" style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginTop: 6 }}><span>1</span><span>20</span></div>
          <div style={{ display: 'flex', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
            {CABS.map((c) => {
              const active = c.name === rec.name;
              return <span key={c.name} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, padding: '6px 11px', borderRadius: 'var(--radius-pill)', background: active ? 'var(--color-primary)' : 'var(--surface-sunken)', color: active ? '#fff' : 'var(--ink-500)', transition: 'all .2s ease' }}>{c.min}{c.max > c.min ? `–${c.max}` : ''}</span>;
            })}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--sky-800))', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: 'clamp(24px,3vw,36px)', color: '#fff' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>Recommended vehicle</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ph-fill ${rec.icon}`} style={{ fontSize: 38 }} />
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', lineHeight: 1 }}>{rec.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>{rec.note} · {rec.cap}</div>
            </div>
          </div>
          <button onClick={() => api.inquiry({ destination: `Private cab (${rec.name}, ${pax} pax)` })} style={{ marginTop: 26, width: '100%', background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '13px 0', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>Get a quote for {pax} {pax === 1 ? 'traveller' : 'travellers'}</button>
        </div>
      </div>
    </Section>
  );
}

// ---------- Trekking ----------
function Trekking({ api }) {
  return (
    <Section id="treks" dark style={{ background: 'linear-gradient(180deg, var(--navy-700), var(--navy-800))' }}>
      <SectionHead dark eyebrow="Adventure & trekking" title="Trails for every fitness level" sub="Guided Himalayan treks with fixed Friday departures. Each includes a packing checklist, weather brief and all permits." align="center" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 22 }}>
        {window.BPT.TREKS.map((t, i) => <Reveal key={t.id} delay={(i % 3) * 0.06}><TrekCard t={t} api={api} /></Reveal>)}
      </div>
      <div style={{ marginTop: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-on-dark-muted)' }}>
        <span style={{ fontWeight: 700, color: '#fff' }}>Every trek includes</span>
        <span><i className="ph ph-backpack" style={{ color: 'var(--yellow-400)' }} /> Packing checklist</span>
        <span><i className="ph ph-cloud-sun" style={{ color: 'var(--yellow-400)' }} /> Weather brief</span>
        <span><i className="ph ph-file-text" style={{ color: 'var(--yellow-400)' }} /> All permits arranged</span>
        <span><i className="ph ph-first-aid-kit" style={{ color: 'var(--yellow-400)' }} /> First-aid & guide</span>
      </div>
    </Section>
  );
}

function TrekCard({ t, api }) {
  const diffColor = t.difficulty === 'Easy' ? 'var(--green-400)' : t.difficulty.includes('Moderate') && !t.difficulty.includes('Easy') ? 'var(--yellow-400)' : 'var(--orange-400)';
  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }} className="bpt-lift">
      <div style={{ position: 'relative', height: 160 }}>
        <SmartImg keywords={t.kw} seed={t.seed} label={t.name.split(' ')[0]} grad="linear-gradient(135deg,#0B2038,#1479B8)" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,15,27,.7), transparent 55%)' }} />
        <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(4px)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', padding: '4px 11px', borderRadius: 'var(--radius-pill)' }}><i className="ph ph-calendar-blank" /> Friday departures</span>
        <div style={{ position: 'absolute', bottom: 10, left: 14, display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)' }}><i className="ph-fill ph-mountains" /> {t.altitude}</div>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', color: '#fff' }}>{t.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <TrekStat label="Difficulty" value={t.difficulty} color={diffColor} />
          <TrekStat label="Fitness" value={t.fitness} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-on-dark-muted)', marginBottom: 5 }}>
            <span>Adventure score</span><span style={{ fontWeight: 700, color: 'var(--yellow-400)' }}>{t.score}/10</span>
          </div>
          <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
            <div style={{ width: `${t.score * 10}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(90deg, var(--yellow-400), var(--color-cta))' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', color: '#fff' }}>₹{t.price.toLocaleString('en-IN')}</div>
          <button onClick={() => api.inquiry({ destination: t.name })} style={{ background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '10px 18px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>Book now</button>
        </div>
      </div>
    </div>
  );
}

function TrekStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--ink-on-dark-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, color: color || '#fff' }}>{value}</div>
    </div>
  );
}

// ---------- Travel guides ----------
function Guides() {
  return (
    <Section id="guides">
      <SectionHead eyebrow="Knowledge centre" title="Travel guides & checklists" sub="Everything you need to prepare — packing lists, visa steps and season guides, written by our travel team." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
        {window.BPT.GUIDES.map((g, i) => (
          <Reveal key={g.title} delay={(i % 4) * 0.05}>
            <a href="#" onClick={(e) => e.preventDefault()} className="bpt-guide" style={{ display: 'block', textDecoration: 'none', background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 20, height: '100%', boxSizing: 'border-box', transition: 'box-shadow .2s ease, transform .2s ease' }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><i className={`ph ${g.icon}`} style={{ fontSize: 24, color: 'var(--color-primary)' }} /></span>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--ink-900)', marginBottom: 6 }}>{g.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', lineHeight: 'var(--leading-normal)' }}>{g.desc}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}><i className="ph ph-clock" /> {g.read} read</div>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ---------- Trust, testimonials, gallery ----------
function Trust() {
  return (
    <Section id="trust" style={{ background: 'var(--surface-page)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 64 }}>
        {window.BPT.TRUST.map((t) => (
          <div key={t.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 20 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><i className={`ph-fill ${t.icon}`} style={{ fontSize: 22, color: 'var(--color-success)' }} /></span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--ink-900)' }}>{t.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 4, lineHeight: 'var(--leading-normal)' }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionHead eyebrow="Loved by travellers" title="Real trips, real reviews" align="center" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22, marginBottom: 64 }}>
        {window.BPT.TESTIMONIALS.map((t) => (
          <div key={t.name} style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 2, color: 'var(--yellow-500)' }}>{[0, 1, 2, 3, 4].map((i) => <i key={i} className="ph-fill ph-star" />)}</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--ink-700)', margin: 0 }}>“{t.quote}”</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
              <span style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sky-400), var(--sky-700))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{t.name[0]}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--ink-900)' }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{t.trip}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionHead eyebrow="From our travellers" title="On the road with us" align="center" />
      <div className="bpt-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {window.BPT.GALLERY.map((g, i) => (
          <div key={i} style={{ position: 'relative', paddingBottom: '75%', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }} className="bpt-gal-item">
            <SmartImg keywords={g.kw} seed={g.seed} label="" />
          </div>
        ))}
      </div>
    </Section>
  );
}

// ---------- Contact + Footer ----------
function Contact({ api }) {
  const c = window.BPT.CONTACT;
  const rows = [
    { icon: 'ph-map-pin', label: 'Office', value: c.address },
    { icon: 'ph-user-circle', label: c.role, value: c.founder },
    { icon: 'ph-phone', label: 'Phone & WhatsApp', value: c.phone },
    { icon: 'ph-clock', label: 'Business hours', value: c.hours },
    { icon: 'ph-headset', label: 'Support', value: c.support },
    { icon: 'ph-envelope-simple', label: 'Email', value: c.email },
  ];
  return (
    <Section id="contact">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'stretch' }} className="bpt-contact-grid">
        <div>
          <SectionHead eyebrow="Get in touch" title="Plan your trip with us" sub="Call, WhatsApp or drop by our Jhansi office. Our team replies fast and plans everything around your dates and budget." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((r) => (
              <div key={r.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><i className={`ph ${r.icon}`} style={{ fontSize: 20, color: 'var(--color-primary)' }} /></span>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--ink-500)' }}>{r.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--ink-900)', marginTop: 2 }}>{r.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <a href={`tel:${c.phoneRaw}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', borderRadius: 'var(--radius-pill)', padding: '13px 22px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)' }}><i className="ph-fill ph-phone" /> Call now</a>
            <a href={`https://wa.me/${c.phoneRaw}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-success)', color: '#fff', textDecoration: 'none', borderRadius: 'var(--radius-pill)', padding: '13px 22px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)' }}><i className="ph-fill ph-whatsapp-logo" /> WhatsApp</a>
          </div>
        </div>
        <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', minHeight: 420 }}>
          <iframe title="Bundelkhand Pride Travels — Jhansi" width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: 420 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Jhansi,Uttar+Pradesh,India&output=embed"></iframe>
        </div>
      </div>
    </Section>
  );
}

function Footer({ api }) {
  const c = window.BPT.CONTACT;
  const cols = [
    { title: 'Explore', items: ['Domestic packages', 'International packages', 'Group departures', 'Treks', 'Travel guides'] },
    { title: 'Company', items: ['About us', 'Special offers', 'Personal & cab tours', 'Contact'] },
    { title: 'Policies', items: ['Terms & conditions', 'Privacy policy', 'Refund policy', 'Cancellation policy'] },
  ];
  return (
    <footer style={{ background: 'var(--surface-dark-2)', color: 'var(--ink-on-dark-muted)', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, marginBottom: 44 }} className="bpt-foot-grid">
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--sky-500), var(--sky-700))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph-fill ph-mountains" style={{ color: '#fff', fontSize: 22 }} /></span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-md)', color: '#fff' }}>Bundelkhand <span style={{ color: 'var(--color-cta)' }}>Pride</span> Travels</div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 18px' }}>Open the world, close to you. Curated holidays, group departures and treks — planned end to end from Jhansi, UP.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['ph-instagram-logo', 'ph-facebook-logo', 'ph-youtube-logo', 'ph-whatsapp-logo'].map((ic) => (
                <a key={ic} href="#" onClick={(e) => e.preventDefault()} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}><i className={`ph-fill ${ic}`} /></a>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 14, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map((i) => <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--ink-on-dark-muted)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>{i}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)' }}>Get trip deals & new departures</div>
            <div style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>One helpful email a month. No spam.</div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); api.toast('Thanks — you’re subscribed to trip updates.', 'ph-check-circle'); e.target.reset(); }} style={{ display: 'flex', gap: 8, flex: '1 1 300px', maxWidth: 420 }}>
            <input required type="email" placeholder="you@email.com" style={{ flex: 1, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 'var(--radius-pill)', padding: '12px 18px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', outline: 'none' }} />
            <button type="submit" style={{ background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '12px 22px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Subscribe</button>
          </form>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
          <span>© 2026 Bundelkhand Pride Travels · {c.address}</span>
          <span>Made with care in Jhansi, Uttar Pradesh</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { CabRecommender, Trekking, Guides, Trust, Contact, Footer });
