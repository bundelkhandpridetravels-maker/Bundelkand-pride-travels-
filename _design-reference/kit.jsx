/* global React */
// ============ shared hooks + layout helpers ============
const { useState, useEffect, useRef } = React;

// Live countdown to a target date -> {days,hours,mins,secs,done}
function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = target instanceof Date ? target.getTime() : new Date(target).getTime();
  let diff = Math.max(0, end - now);
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000); diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);
  return { days, hours, mins, secs, done: end - now <= 0 };
}

// Count-up when scrolled into view
function useCountUp(target, dur = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, dur]);
  return [val, ref];
}

// Fade + rise in on scroll
function Reveal({ children, delay = 0, y = 24, style = {}, as = 'div' }) {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style,
    }}>{children}</Tag>
  );
}

// Standard section shell
function Section({ id, dark = false, wide = false, children, style = {}, pad = true }) {
  return (
    <section id={id} data-screen-label={id} style={{
      background: dark ? 'var(--surface-dark)' : 'transparent',
      color: dark ? 'var(--ink-on-dark)' : 'var(--ink-900)',
      padding: pad ? 'clamp(56px, 8vw, 104px) 24px' : 0,
      position: 'relative', ...style,
    }}>
      <div style={{ maxWidth: wide ? 1440 : 1200, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Eyebrow({ children, dark = false }) {
  return (
    <div style={{
      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700,
      letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
      color: dark ? 'var(--yellow-400)' : 'var(--color-primary)', marginBottom: 12,
    }}>{children}</div>
  );
}

function SectionHead({ eyebrow, title, sub, dark = false, align = 'left', maxSub = 620 }) {
  return (
    <div style={{ textAlign: align, marginBottom: 'clamp(32px, 5vw, 56px)', maxWidth: align === 'center' ? 780 : undefined, marginLeft: align === 'center' ? 'auto' : undefined, marginRight: align === 'center' ? 'auto' : undefined }}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)',
        lineHeight: 'var(--leading-tight)', fontSize: 'clamp(1.9rem, 3.6vw, 2.875rem)',
        margin: 0, color: dark ? '#fff' : 'var(--ink-900)',
      }}>{title}</h2>
      {sub && <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)',
        color: dark ? 'var(--ink-on-dark-muted)' : 'var(--ink-500)', margin: '14px 0 0',
        maxWidth: maxSub, marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0,
      }}>{sub}</p>}
    </div>
  );
}

// Reusable countdown pill row
function CountdownRow({ target, dark = false, compact = false }) {
  const c = useCountdown(target);
  const box = (n, l) => (
    <div style={{ textAlign: 'center', minWidth: compact ? 42 : 56 }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: compact ? '1.25rem' : 'clamp(1.4rem, 3vw, 2rem)',
        lineHeight: 1, color: dark ? '#fff' : 'var(--ink-900)',
        background: dark ? 'rgba(255,255,255,0.08)' : 'var(--surface-sunken)',
        borderRadius: 'var(--radius-md)', padding: compact ? '8px 6px' : '12px 8px',
        fontVariantNumeric: 'tabular-nums',
      }}>{String(n).padStart(2, '0')}</div>
      <div style={{ fontSize: '0.62rem', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginTop: 6, color: dark ? 'var(--ink-on-dark-muted)' : 'var(--ink-500)', fontWeight: 600 }}>{l}</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: compact ? 6 : 10, alignItems: 'flex-start' }}>
      {box(c.days, 'Days')}{box(c.hours, 'Hrs')}{box(c.mins, 'Min')}{box(c.secs, 'Sec')}
    </div>
  );
}

Object.assign(window, { useCountdown, useCountUp, Reveal, Section, Eyebrow, SectionHead, CountdownRow });
