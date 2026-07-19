/* global React */
// ============ Inquiry modal, exit popup, toasts, sticky bar, WhatsApp FAB ============
const { useState: oState, useEffect: oEffect, useRef: oRef } = React;

const STYLES = ['Family', 'Couple', 'Group', 'Honeymoon', 'Adventure', 'Corporate', 'Solo', 'Pilgrimage'];
const BUDGETS = ['Under ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'];
const HOTELS = ['3-star', '4-star', '5-star', 'Homestay / boutique'];
const CITIES = ['Jhansi', 'Delhi', 'Lucknow', 'Kanpur', 'Gwalior', 'Bhopal', 'Other'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const blank = () => ({ destination: '', intl: false, styles: [], month: '', nights: 4, adults: 2, children: 0, city: 'Jhansi', budget: '', hotel: '', requests: '', name: '', mobile: '', contactPref: 'WhatsApp' });

function InquiryModal({ open, prefill, onClose, toast }) {
  const [step, setStep] = oState(0);
  const [data, setData] = oState(blank());
  const [otp, setOtp] = oState(['', '', '', '', '', '']);
  const [otpErr, setOtpErr] = oState(false);
  const [refId, setRefId] = oState('');
  const otpRefs = oRef([]);

  oEffect(() => {
    if (open) {
      const d = blank();
      if (prefill) Object.assign(d, prefill);
      setData(d); setStep(0); setOtp(['', '', '', '', '', '']); setOtpErr(false);
      setRefId('BPT' + Math.floor(100000 + Math.random() * 899999));
    }
  }, [open, prefill]);

  if (!open) return null;
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const toggleStyle = (s) => setData((d) => ({ ...d, styles: d.styles.includes(s) ? d.styles.filter((x) => x !== s) : [...d.styles, s] }));

  const needsOtp = data.intl;
  // step flow: 0,1,2,3 form -> (4 otp if intl) -> confirm
  const CONFIRM = needsOtp ? 5 : 4;
  const OTP_STEP = 4;

  const canNext = () => {
    if (step === 0) return data.destination.trim() && data.styles.length;
    if (step === 1) return data.month;
    if (step === 2) return data.budget && data.hotel;
    if (step === 3) return data.name.trim() && /^\d{10}$/.test(data.mobile.replace(/\D/g, '').slice(-10)) === true && data.mobile.replace(/\D/g, '').length >= 10;
    return true;
  };

  const next = () => {
    if (step === 3) { setStep(needsOtp ? OTP_STEP : CONFIRM); return; }
    setStep(step + 1);
  };
  const back = () => setStep(Math.max(0, step === CONFIRM && needsOtp ? OTP_STEP : step - 1));

  const verifyOtp = () => {
    if (otp.join('').length === 6) { setOtpErr(false); setStep(CONFIRM); }
    else setOtpErr(true);
  };
  const onOtpChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) otpRefs.current[i + 1] && otpRefs.current[i + 1].focus();
  };

  const totalSteps = 4;
  const progress = step >= CONFIRM ? 100 : step === OTP_STEP ? 92 : ((step + 1) / totalSteps) * (needsOtp ? 80 : 100);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,32,56,0.55)', backdropFilter: 'blur(3px)', zIndex: 900, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} className="bpt-modal-in" style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', width: 'min(560px, 100%)', margin: 'auto 0', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>{step >= CONFIRM ? 'Inquiry received' : 'Plan your trip'}</div>
            {step < CONFIRM && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 2 }}>{step === OTP_STEP ? 'Verify your mobile number' : `Step ${step + 1} of ${totalSteps}`}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'var(--surface-sunken)', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', color: 'var(--ink-700)', flexShrink: 0 }}><i className="ph ph-x" /></button>
        </div>
        {step < CONFIRM && (
          <div style={{ height: 4, background: 'var(--surface-sunken)', margin: '16px 24px 0', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-cta)', borderRadius: 'var(--radius-pill)', transition: 'width .3s ease' }} />
          </div>
        )}

        <div style={{ padding: '22px 24px 24px', maxHeight: '62vh', overflowY: 'auto' }}>
          {step === 0 && (
            <Field>
              <Lbl>Where do you want to go?</Lbl>
              <input value={data.destination} onChange={(e) => set('destination', e.target.value)} placeholder="e.g. Kashmir, Manali, Bali" style={inp} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 'var(--text-sm)', color: 'var(--ink-700)', cursor: 'pointer' }}>
                <input type="checkbox" checked={data.intl} onChange={(e) => set('intl', e.target.checked)} /> This is an international trip
              </label>
              <Lbl style={{ marginTop: 20 }}>Travel style</Lbl>
              <Pills options={STYLES} selected={data.styles} onToggle={toggleStyle} />
            </Field>
          )}
          {step === 1 && (
            <Field>
              <Lbl>Travel month</Lbl>
              <Pills options={MONTHS} selected={data.month ? [data.month] : []} onToggle={(m) => set('month', m)} single />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                <div><Lbl>Adults</Lbl><Counter value={data.adults} min={1} onChange={(v) => set('adults', v)} /></div>
                <div><Lbl>Children</Lbl><Counter value={data.children} min={0} onChange={(v) => set('children', v)} /></div>
              </div>
              <div style={{ marginTop: 18 }}><Lbl>Nights: <b style={{ color: 'var(--color-primary)' }}>{data.nights}</b></Lbl>
                <input type="range" min="1" max="15" value={data.nights} onChange={(e) => set('nights', +e.target.value)} className="bpt-range" style={{ width: '100%' }} />
              </div>
              <Lbl style={{ marginTop: 18 }}>Departure city</Lbl>
              <select value={data.city} onChange={(e) => set('city', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
          )}
          {step === 2 && (
            <Field>
              <Lbl>Budget per person</Lbl>
              <Pills options={BUDGETS} selected={data.budget ? [data.budget] : []} onToggle={(b) => set('budget', b)} single />
              <Lbl style={{ marginTop: 20 }}>Hotel preference</Lbl>
              <Pills options={HOTELS} selected={data.hotel ? [data.hotel] : []} onToggle={(h) => set('hotel', h)} single />
              <Lbl style={{ marginTop: 20 }}>Special requests <span style={{ fontWeight: 400, color: 'var(--ink-500)' }}>(optional)</span></Lbl>
              <textarea value={data.requests} onChange={(e) => set('requests', e.target.value)} rows={3} placeholder="Anniversary, food preference, accessibility…" style={{ ...inp, resize: 'vertical' }} />
            </Field>
          )}
          {step === 3 && (
            <Field>
              <Lbl>Your name</Lbl>
              <input value={data.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" style={inp} />
              <Lbl style={{ marginTop: 16 }}>Mobile number</Lbl>
              <input value={data.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="10-digit mobile" inputMode="numeric" style={inp} />
              <Lbl style={{ marginTop: 16 }}>How should we contact you?</Lbl>
              <Pills options={['WhatsApp', 'Call', 'Email']} selected={[data.contactPref]} onToggle={(p) => set('contactPref', p)} single />
              {data.intl && <div style={{ marginTop: 16, display: 'flex', gap: 8, background: 'var(--color-info-soft)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: 'var(--text-sm)', color: 'var(--ink-700)' }}><i className="ph-fill ph-shield-check" style={{ color: 'var(--color-primary)' }} /> We’ll send a 6-digit OTP to verify your mobile before submitting this international inquiry.</div>}
            </Field>
          )}
          {step === OTP_STEP && (
            <Field>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', margin: '0 0 18px', lineHeight: 'var(--leading-relaxed)' }}>Enter the 6-digit code sent to <b>{data.mobile || 'your mobile'}</b>. <span style={{ color: 'var(--ink-500)' }}>(Demo: type any 6 digits.)</span></p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {otp.map((v, i) => (
                  <input key={i} ref={(el) => (otpRefs.current[i] = el)} value={v} onChange={(e) => onOtpChange(i, e.target.value)} maxLength={1} inputMode="numeric"
                    style={{ width: 46, height: 56, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', border: `1px solid ${otpErr ? 'var(--color-error)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--ink-900)', outline: 'none' }} />
                ))}
              </div>
              {otpErr && <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: 10, textAlign: 'center' }}>Please enter all 6 digits.</div>}
              <div style={{ textAlign: 'center', marginTop: 16 }}><button onClick={() => toast('OTP resent to ' + (data.mobile || 'your mobile'), 'ph-arrow-clockwise')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>Resend code</button></div>
            </Field>
          )}
          {step >= CONFIRM && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div className="bpt-check" style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--color-success-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><i className="ph-fill ph-check-circle" style={{ fontSize: 42, color: 'var(--color-success)' }} /></div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>Thanks, {data.name.split(' ')[0] || 'traveller'}!</div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', margin: '6px 0 0' }}>Our team will reach out on {data.contactPref} within a few hours.</p>
              </div>
              <div style={{ background: 'var(--surface-page)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700 }}>Inquiry ID</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>{refId}</span>
                </div>
                {[
                  ['Destination', data.destination + (data.intl ? ' (International)' : '')],
                  ['Travel style', data.styles.join(', ') || '—'],
                  ['When', `${data.month || '—'} · ${data.nights} nights`],
                  ['Travellers', `${data.adults} adult${data.adults > 1 ? 's' : ''}${data.children ? `, ${data.children} child` : ''} · from ${data.city}`],
                  ['Budget / hotel', `${data.budget || '—'} · ${data.hotel || '—'}`],
                  ['Contact', `${data.mobile || '—'} · via ${data.contactPref}`],
                  ...(data.requests ? [['Requests', data.requests]] : []),
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 14, padding: '7px 0', fontSize: 'var(--text-sm)' }}>
                    <span style={{ width: 120, flexShrink: 0, color: 'var(--ink-500)' }}>{k}</span>
                    <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* footer buttons */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
          {step < CONFIRM && step !== OTP_STEP && step > 0 && <button onClick={back} style={btnGhost}>Back</button>}
          {step === OTP_STEP && <button onClick={back} style={btnGhost}>Back</button>}
          {step < 3 && <button onClick={next} disabled={!canNext()} style={{ ...btnPrimary, opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}>Continue <i className="ph-bold ph-arrow-right" /></button>}
          {step === 3 && <button onClick={next} disabled={!canNext()} style={{ ...btnPrimary, opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}>{needsOtp ? 'Verify mobile' : 'Submit inquiry'}</button>}
          {step === OTP_STEP && <button onClick={verifyOtp} style={btnPrimary}>Verify & submit</button>}
          {step >= CONFIRM && <button onClick={onClose} style={btnPrimary}>Done</button>}
        </div>
      </div>
    </div>
  );
}

const inp = { width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--ink-900)', background: 'var(--surface-raised)', outline: 'none' };
const btnPrimary = { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '13px 0', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' };
const btnGhost = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', color: 'var(--ink-700)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: '13px 22px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' };

function Field({ children }) { return <div className="bpt-step-in">{children}</div>; }
function Lbl({ children, style }) { return <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--ink-900)', marginBottom: 8, ...style }}>{children}</label>; }
function Pills({ options, selected, onToggle, single }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = selected.includes(o);
        return <button key={o} type="button" onClick={() => onToggle(o)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, padding: '9px 15px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', border: on ? '1px solid var(--color-primary)' : '1px solid var(--border)', background: on ? 'var(--color-primary-soft)' : 'var(--surface-raised)', color: on ? 'var(--color-primary)' : 'var(--ink-700)', transition: 'all .15s ease' }}>{o}</button>;
      })}
    </div>
  );
}
function Counter({ value, min, onChange }) {
  const btn = { width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface-raised)', color: 'var(--ink-900)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} style={btn}><i className="ph ph-minus" /></button>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', minWidth: 24, textAlign: 'center' }}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} style={btn}><i className="ph ph-plus" /></button>
    </div>
  );
}

// ---------- Recently-enquired toast stack ----------
const FEED = [
  { name: 'Rahul', place: 'Manali Volvo package' }, { name: 'Sneha', place: 'Kashmir valley tour' },
  { name: 'Aditya', place: 'Goa New Year package' }, { name: 'Meera', place: 'Kerala backwaters' },
  { name: 'Karan', place: 'Chopta trek' }, { name: 'Divya', place: 'Bali honeymoon' },
  { name: 'Farhan', place: 'Dubai city tour' }, { name: 'Ishita', place: 'Kedarnath group tour' },
];
function ToastStack({ toasts, dismiss }) {
  return (
    <div style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 850, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
      {toasts.map((t) => (
        <div key={t.id} className="bpt-toast-in" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-dark)', color: 'var(--ink-on-dark)', padding: '13px 16px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
          <i className={`ph-fill ${t.icon || 'ph-map-pin'}`} style={{ color: t.icon ? 'var(--color-success)' : 'var(--yellow-400)', fontSize: 20, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: 'var(--ink-on-dark-muted)', cursor: 'pointer' }}><i className="ph ph-x" /></button>
        </div>
      ))}
    </div>
  );
}

// ---------- Exit-intent popup ----------
function ExitPopup({ open, onClose, onClaim }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,32,56,0.55)', backdropFilter: 'blur(3px)', zIndex: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="bpt-modal-in" style={{ width: 'min(440px,100%)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', fontFamily: 'var(--font-body)', position: 'relative' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, border: 'none', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', color: '#fff', zIndex: 2 }}><i className="ph ph-x" /></button>
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--sky-800))', padding: '34px 28px 26px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--yellow-400)', marginBottom: 10 }}>Wait — before you go</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.4rem', lineHeight: 1 }}>₹500 off</div>
          <div style={{ fontSize: 'var(--text-md)', marginTop: 8, color: 'rgba(255,255,255,0.9)' }}>your first booking with us</div>
        </div>
        <div style={{ padding: '24px 28px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 18px' }}>Tell us where you want to go and we’ll apply <b>₹500 off</b> to your first trip. No strings attached.</p>
          <button onClick={onClaim} style={{ width: '100%', background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '14px 0', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-base)', cursor: 'pointer', boxShadow: 'var(--shadow-glow-cta)' }}>Claim ₹500 off</button>
          <button onClick={onClose} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--ink-500)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>No thanks, maybe later</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Sticky book bar + WhatsApp FAB ----------
function StickyBar({ api }) {
  const [show, setShow] = oState(false);
  oEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const c = window.BPT.CONTACT;
  return (
    <>
      <a href={`https://wa.me/${c.phoneRaw}`} target="_blank" rel="noreferrer" aria-label="WhatsApp us" className="bpt-fab" style={{ position: 'fixed', right: 20, bottom: show ? 90 : 24, zIndex: 830, width: 58, height: 58, borderRadius: '50%', background: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', textDecoration: 'none', transition: 'bottom .3s ease' }}>
        <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: 30 }} />
      </a>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 820, transform: show ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .35s cubic-bezier(.22,1,.36,1)', padding: 12, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,252,246,0.92)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-lg)', padding: '8px 8px 8px 20px', maxWidth: 560, width: '100%', justifyContent: 'space-between' }} className="bpt-stickybar">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-700)' }}>
            <b style={{ color: 'var(--ink-900)' }}>Book with ₹3,000 advance</b><span className="bpt-hide-sm"> · pay the rest before departure</span>
          </div>
          <button onClick={() => api.inquiry()} style={{ background: 'var(--color-cta)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '11px 22px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Book now</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { InquiryModal, ToastStack, ExitPopup, StickyBar, FEED });
