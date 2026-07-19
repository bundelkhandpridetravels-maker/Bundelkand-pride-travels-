/* global React, Section, SmartImg */
// ============ Header + Hero + Stats ============
const { useState: aState, useEffect: aEffect, useRef: aRef } = React;

function Header({ api }) {
  const [scrolled, setScrolled] = aState(false);
  const [menu, setMenu] = aState(false);
  aEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const solid = scrolled || menu;
  const jump = (id) => (e) => { e.preventDefault(); setMenu(false); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' }); };
  const linkColor = solid ? 'var(--ink-700)' : 'rgba(255,255,255,0.92)';
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: solid ? 'rgba(255,252,246,0.92)' : 'transparent',
      backdropFilter: solid ? 'blur(12px)' : 'none',
      boxShadow: solid ? 'var(--shadow-sm)' : 'none',
      transition: 'background .3s ease, box-shadow .3s ease',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <a href="#top" onClick={jump('top')} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, var(--sky-500), var(--sky-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <i className="ph-fill ph-mountains" style={{ color: '#fff', fontSize: 20 }} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1, color: solid ? 'var(--ink-900)' : '#fff', textShadow: solid ? 'none' : '0 1px 8px rgba(11,32,56,.4)' }}>
            Bundelkhand <span style={{ color: 'var(--color-cta)' }}>Pride</span><br /><span style={{ fontWeight: 600, fontSize: '0.72rem', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: solid ? 'var(--ink-500)' : 'rgba(255,255,255,0.75)' }}>Travels</span>
          </span>
        </a>
        <nav className="bpt-nav" style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
          {window.BPT.NAV.map((l) => {
            const id = l.toLowerCase().replace(/ /g, '-');
            return <a key={l} href={`#${id}`} onClick={jump(id)} className="bpt-navlink" style={{ textDecoration: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, color: linkColor, whiteSpace: 'nowrap' }}>{l}</a>;
          })}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <a href={`tel:${window.BPT.CONTACT.phoneRaw}`} className="bpt-nav" style={{ textDecoration: 'none', fontSize: 'var(--text-sm)', fontWeight: 700, color: solid ? 'var(--color-primary)' : '#fff', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <i className="ph-fill ph-phone" /> {window.BPT.CONTACT.phone}
          </a>
          <button onClick={() => api.inquiry()} style={{
            background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)',
            padding: '10px 20px', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap',
          }}>Plan my trip</button>
          <button className="bpt-burger" onClick={() => setMenu(!menu)} aria-label="Menu" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, color: solid ? 'var(--ink-900)' : '#fff' }}>
            <i className={menu ? 'ph ph-x' : 'ph ph-list'} />
          </button>
        </div>
      </div>
      {menu && (
        <div style={{ background: 'var(--surface-raised)', padding: '8px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {window.BPT.NAV.map((l) => {
            const id = l.toLowerCase().replace(/ /g, '-');
            return <a key={l} href={`#${id}`} onClick={jump(id)} style={{ textDecoration: 'none', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-700)', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>{l}</a>;
          })}
        </div>
      )}
    </header>
  );
}

function Hero({ api }) {
  const [m, setM] = aState({ x: 0, y: 0 });
  const onMove = (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5);
    const cy = (e.clientY / window.innerHeight - 0.5);
    setM({ x: cx, y: cy });
  };
  const px = (f) => ({ transform: `translate(${m.x * f}px, ${m.y * f}px)` });
  return (
    <section id="top" data-screen-label="hero" onMouseMove={onMove} style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center',
      background: 'linear-gradient(180deg, #8FD3F4 0%, #C9EEFB 42%, #EAF8FE 100%)',
    }}>
      {/* sun + clouds (mid parallax) */}
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${m.x * 12}px, ${m.y * 8}px)` }}>
        <div style={{ position: 'absolute', top: '-8%', right: '8%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,92,0.9), rgba(255,214,92,0) 65%)' }} />
        <div className="bpt-cloud" style={{ top: '16%', animationDuration: '52s' }} />
        <div className="bpt-cloud bpt-cloud--sm" style={{ top: '30%', animationDuration: '38s', animationDelay: '-12s' }} />
        <div className="bpt-cloud" style={{ top: '52%', animationDuration: '64s', animationDelay: '-30s', opacity: 0.75 }} />
        <div className="bpt-cloud bpt-cloud--sm" style={{ top: '9%', animationDuration: '46s', animationDelay: '-20s', opacity: 0.8 }} />
      </div>
      {/* airplane + trail */}
      <div className="bpt-plane-wrap" aria-hidden="true">
        <div className="bpt-plane">
          <span className="bpt-trail" />
          <i className="ph-fill ph-airplane-tilt" style={{ fontSize: 34, color: 'var(--navy-600)' }} />
        </div>
      </div>
      {/* mountains (far parallax) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%', transform: `translate(${m.x * -6}px, ${m.y * -4}px)` }}>
        <SmartImg keywords="himalaya,mountain,valley" seed={9} label="" grad="linear-gradient(180deg,#7FB8D9,#3E6F8E)" style={{ position: 'absolute', inset: 0, WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%)', maskImage: 'linear-gradient(180deg, transparent, #000 30%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(234,248,254,0) 0%, rgba(234,248,254,.15) 60%, rgba(255,252,246,.9) 100%)' }} />
      </div>

      {/* content */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1200, margin: '0 auto', padding: '96px 24px 40px', width: '100%', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 40, alignItems: 'center' }} className="bpt-hero-grid">
        <div>
          <div className="bpt-fade-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(6px)', padding: '7px 14px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--navy-700)', letterSpacing: 'var(--tracking-wide)', boxShadow: 'var(--shadow-sm)', marginBottom: 22 }}>
            <i className="ph-fill ph-seal-check" style={{ color: 'var(--color-primary)' }} /> Trusted travel company · Jhansi, UP
          </div>
          <h1 className="bpt-fade-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.04, fontSize: 'clamp(2.6rem, 6vw, 4.6rem)', margin: 0, color: 'var(--navy-800)' }}>
            Open the world,<br /><span style={{ background: 'linear-gradient(100deg, var(--color-cta), var(--yellow-500))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>close to you.</span>
          </h1>
          <p className="bpt-fade-3" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem,1.6vw,1.25rem)', lineHeight: 'var(--leading-relaxed)', color: 'var(--navy-600)', margin: '20px 0 30px', maxWidth: 520 }}>
            Curated holiday packages, weekly group departures and adventure treks — planned end to end, so you just travel.
          </p>
          <div className="bpt-fade-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
            <button onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })} style={ctaStyle('secondary')}><i className="ph-fill ph-compass" /> Explore packages</button>
            <button onClick={() => api.inquiry()} style={ctaStyle('primary')}><i className="ph-fill ph-airplane-takeoff" /> Book now</button>
            <a href={`tel:${window.BPT.CONTACT.phoneRaw}`} style={ctaStyle('outline')}><i className="ph-fill ph-phone" /> Call</a>
            <a href={`https://wa.me/${window.BPT.CONTACT.phoneRaw}`} target="_blank" rel="noreferrer" style={ctaStyle('wa')}><i className="ph-fill ph-whatsapp-logo" /> WhatsApp</a>
          </div>
          <div className="bpt-fade-3" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(6px)', padding: '10px 16px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', gap: 2, color: 'var(--yellow-500)' }}>
              {[0, 1, 2, 3, 4].map((i) => <i key={i} className="ph-fill ph-star" />)}
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--navy-700)' }}>4.8</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}>Google rating · 900+ reviews</span>
          </div>
        </div>

        {/* floating glass preview card */}
        <div className="bpt-fade-4" style={{ justifySelf: 'center' }}>
          <div className="bpt-float" style={{ width: 300, borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 168 }}>
              <SmartImg keywords="manali,snow,mountain" seed={21} label="Manali" />
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--color-energy)', color: 'var(--navy-700)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Best seller</span>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--ink-900)' }}>Manali Volvo package</div>
              <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', margin: '8px 0 12px' }}>
                <span><i className="ph ph-calendar-blank" /> 5N / 6D</span>
                <span><i className="ph ph-bus" /> Volvo</span>
                <span><i className="ph-fill ph-star" style={{ color: 'var(--yellow-500)' }} /> 4.8</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textDecoration: 'line-through' }}>₹15,999</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--ink-900)' }}>₹12,999</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>/ person</span>
              </div>
              <button onClick={() => api.inquiry({ destination: 'Manali' })} style={{ marginTop: 14, width: '100%', background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '11px 0', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>Book now</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 5, color: 'var(--navy-600)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: 'var(--tracking-wide)' }} className="bpt-scroll-cue">
        <span>Scroll to explore</span>
        <i className="ph ph-caret-down" style={{ fontSize: 18 }} />
      </div>
    </section>
  );
}

function ctaStyle(kind) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', padding: '13px 22px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', textDecoration: 'none', border: '1px solid transparent', transition: 'transform .15s ease, box-shadow .2s ease' };
  if (kind === 'primary') return { ...base, background: 'var(--color-cta)', color: '#fff', boxShadow: 'var(--shadow-md)' };
  if (kind === 'secondary') return { ...base, background: 'var(--color-primary)', color: '#fff', boxShadow: 'var(--shadow-md)' };
  if (kind === 'wa') return { ...base, background: 'var(--color-success)', color: '#fff' };
  return { ...base, background: 'rgba(255,255,255,0.7)', color: 'var(--navy-700)', border: '1px solid rgba(255,255,255,0.9)' };
}

function StatsBand() {
  return (
    <Section id="stats" pad={false} style={{ padding: '0 24px', marginTop: -56, position: 'relative', zIndex: 20 }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto', background: 'var(--surface-raised)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)', padding: 'clamp(24px,4vw,40px)', display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
      }} className="bpt-stats-grid">
        {window.BPT.STATS.map((s, i) => <StatItem key={i} {...s} />)}
      </div>
    </Section>
  );
}

function StatItem({ value, suffix, label, icon }) {
  const [val, ref] = window.useCountUp(value);
  const fmt = value >= 1000 ? val.toLocaleString('en-IN') : val;
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <i className={`ph ${icon}`} style={{ fontSize: 26, color: 'var(--color-primary)', marginBottom: 8, display: 'block' }} />
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem,3.4vw,2.5rem)', color: 'var(--ink-900)', lineHeight: 1 }}>{fmt}{suffix}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { Header, Hero, StatsBand });
