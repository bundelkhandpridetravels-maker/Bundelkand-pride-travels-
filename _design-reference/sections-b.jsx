/* global React, Section, SectionHead, SmartImg, CountdownRow, Reveal */
// ============ Packages + Special packages + Group departures ============
const { useState: bState } = React;

// ---------- Package card with expandable inclusions ----------
function PackageCard({ p, api }) {
  const [open, setOpen] = bState(false);
  return (
    <div className="bpt-pkg" style={{
      background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'box-shadow .25s ease, transform .25s ease',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ position: 'relative', height: 200 }}>
        <SmartImg keywords={p.kw} seed={p.seed} label={p.destination} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,32,56,.55), transparent 55%)' }} />
        {p.badge && <span style={{ position: 'absolute', top: 12, left: 12, background: p.badge === 'Honeymoon' ? 'var(--color-love)' : 'var(--color-energy)', color: p.badge === 'Honeymoon' ? '#fff' : 'var(--navy-700)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{p.badge}</span>}
        <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(11,32,56,.62)', backdropFilter: 'blur(4px)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-xs)', padding: '5px 11px', borderRadius: 'var(--radius-pill)' }}><i className="ph ph-calendar-blank" /> {p.duration}</span>
        <div style={{ position: 'absolute', bottom: 12, left: 14, color: '#fff' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', textShadow: '0 1px 6px rgba(11,32,56,.5)' }}>{p.destination}</div>
        </div>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--ink-900)' }}>{p.name}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {p.tags.map((t) => <span key={t} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)', background: 'var(--color-primary-soft)', padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>{t}</span>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
          <span><i className="ph-fill ph-star" style={{ color: 'var(--yellow-500)' }} /> <b style={{ color: 'var(--ink-900)' }}>{p.rating}</b> ({p.reviews})</span>
          <span><i className="ph ph-sun-horizon" /> {p.bestTime}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
          {p.strike && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', textDecoration: 'line-through' }}>₹{p.strike.toLocaleString('en-IN')}</span>}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--ink-900)' }}>₹{p.price.toLocaleString('en-IN')}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>/ person</span>
        </div>
        {p.seats != null && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: p.seats <= 6 ? 'var(--color-cta)' : 'var(--ink-500)' }}><i className="ph ph-armchair" /> {p.seats} seats left on the next departure</div>}

        <button onClick={() => setOpen(!open)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
          {open ? 'Hide details' : "What's included"} <i className="ph ph-caret-down" style={{ transition: 'transform .25s ease', transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>
        {open && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'var(--surface-page)', borderRadius: 'var(--radius-md)', padding: 14 }} className="bpt-incl">
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>Included</div>
              {p.included.map((x) => <div key={x} style={{ display: 'flex', gap: 6, fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-700)', marginBottom: 6, lineHeight: 1.35 }}><i className="ph-bold ph-check" style={{ color: 'var(--green-500)', marginTop: 2 }} />{x}</div>)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>Excluded</div>
              {p.excluded.map((x) => <div key={x} style={{ display: 'flex', gap: 6, fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 6, lineHeight: 1.35 }}><i className="ph-bold ph-x" style={{ color: 'var(--ink-300)', marginTop: 2 }} />{x}</div>)}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
          <button onClick={() => api.inquiry({ destination: p.destination, intl: !!p.intl })} style={{ flex: 1, background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '11px 0', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>Book now</button>
          <button onClick={() => api.inquiry({ destination: p.destination, intl: !!p.intl })} style={{ flex: 1, background: 'transparent', color: 'var(--ink-900)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: '11px 0', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>Enquire</button>
        </div>
      </div>
    </div>
  );
}

function Packages({ api }) {
  const [tab, setTab] = bState('domestic');
  const list = tab === 'domestic' ? window.BPT.DOMESTIC : window.BPT.INTL;
  return (
    <Section id="packages">
      <SectionHead eyebrow="Holiday packages" title="Pick a trip, we handle the rest" sub="Fixed-price packages with hotels, transfers, sightseeing and on-trip support included. Expand any card to see exactly what's covered." />
      <div style={{ display: 'inline-flex', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', padding: 5, marginBottom: 36 }}>
        {[['domestic', 'Domestic', 'ph-map-pin'], ['international', 'International', 'ph-globe-hemisphere-east']].map(([v, l, ic]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', padding: '10px 22px', borderRadius: 'var(--radius-pill)',
            background: tab === v ? 'var(--surface-raised)' : 'transparent', color: tab === v ? 'var(--color-primary)' : 'var(--ink-500)',
            boxShadow: tab === v ? 'var(--shadow-sm)' : 'none', transition: 'all .2s ease',
          }}><i className={`ph ${ic}`} /> {l}</button>
        ))}
      </div>
      <div className="bpt-pkg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 24 }}>
        {list.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 0.06}><PackageCard p={p} api={api} /></Reveal>)}
      </div>
    </Section>
  );
}

// ---------- Special packages (dark royal band) ----------
function SpecialPackages({ api }) {
  return (
    <Section id="special-offers" dark>
      <SectionHead dark eyebrow="Festive special departures" title="New Year, sorted early" sub="Two group departures built for the season — locked-in prices, limited seats and a live countdown to booking cut-off." align="center" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        {window.BPT.SPECIAL.map((s) => <SpecialCard key={s.id} s={s} api={api} />)}
      </div>
    </Section>
  );
}

function SpecialCard({ s, api }) {
  const badges = s.badges || [s.badge];
  return (
    <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 210 }}>
        <SmartImg keywords={s.kw} seed={s.seed} label={s.destination.split(' ')[0]} grad="linear-gradient(135deg,#0C4A73,#1479B8)" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,23,41,.75), transparent 60%)' }} />
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {badges.map((b) => <span key={b} style={{ background: b.includes('40%') ? 'var(--color-cta)' : b.includes('Honeymoon') ? 'var(--color-love)' : 'var(--color-energy)', color: b.includes('40%') || b.includes('Honeymoon') ? '#fff' : 'var(--navy-700)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{b}</span>)}
        </div>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: '#fff' }}>{s.destination}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-on-dark-muted)', marginTop: 8 }}>
            <span><i className="ph ph-calendar-check" /> {s.departLabel}</span>
            <span><i className="ph ph-moon-stars" /> {s.duration}</span>
            <span><i className="ph ph-path" /> {s.route}</span>
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--ink-on-dark-muted)', margin: 0 }}>{s.blurb}</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--yellow-400)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><i className="ph-fill ph-timer" /> Booking closes in</div>
          <CountdownRow target={s.departs} dark />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', gap: 12 }}>
          <div>
            {s.strike && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-on-dark-muted)', textDecoration: 'line-through' }}>₹{s.strike.toLocaleString('en-IN')}</div>}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: '#fff', lineHeight: 1 }}>₹{s.price.toLocaleString('en-IN')}<span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 'var(--text-sm)', color: 'var(--ink-on-dark-muted)' }}> / person</span></div>
          </div>
          <button onClick={() => api.inquiry({ destination: s.destination })} style={{ background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '13px 24px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', boxShadow: 'var(--shadow-glow-cta)', whiteSpace: 'nowrap' }}>Reserve seat</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Group departures — every Friday ----------
function GroupDepartures({ api }) {
  const friday = window.BPT.nextFriday();
  const fmt = friday.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  return (
    <Section id="group-departures">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 44 }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 12 }}>Every Friday</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-tight)', fontSize: 'clamp(1.9rem,3.6vw,2.875rem)', margin: 0, color: 'var(--ink-900)' }}>Weekend group departures</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', color: 'var(--ink-500)', margin: '14px 0 0' }}>Fixed departures with a guide, transport and stay. Grab a seat before the bus fills up.</p>
        </div>
        <div style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', color: '#fff', minWidth: 260 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--yellow-400)', marginBottom: 10 }}>Next departure · {fmt}</div>
          <CountdownRow target={friday} dark compact />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
        {window.BPT.GROUP_DEPARTURES.map((g, i) => <Reveal key={g.id} delay={(i % 3) * 0.06}><DepartureCard g={g} api={api} /></Reveal>)}
      </div>
    </Section>
  );
}

function DepartureCard({ g, api }) {
  const pct = Math.max(8, Math.round((g.seats / g.total) * 100));
  const urgent = g.seats <= 6;
  return (
    <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="bpt-lift">
      <div style={{ position: 'relative', height: 150 }}>
        <SmartImg keywords={g.kw} seed={g.seed} label={g.name.split(' ')[0]} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,32,56,.5), transparent 60%)' }} />
        <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', padding: '4px 11px', borderRadius: 'var(--radius-pill)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Every Friday</span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--ink-900)' }}>{g.name}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}><i className="ph ph-map-pin" /> {g.meta}</div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: urgent ? 'var(--color-cta)' : 'var(--ink-500)', marginBottom: 5 }}>
            <span>Only {g.seats} seats left</span><span style={{ color: 'var(--ink-300)' }}>{g.total} total</span>
          </div>
          <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: urgent ? 'var(--color-cta)' : 'var(--color-energy)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>₹{g.price.toLocaleString('en-IN')}</div>
          <button onClick={() => api.inquiry({ destination: g.name })} style={{ background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '10px 18px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>Book now</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Packages, SpecialPackages, GroupDepartures });
