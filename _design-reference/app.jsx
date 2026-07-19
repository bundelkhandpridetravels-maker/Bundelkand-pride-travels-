/* global React, ReactDOM, Header, Hero, StatsBand, Packages, SpecialPackages, GroupDepartures, CabRecommender, Trekking, Guides, Trust, Contact, Footer, InquiryModal, ToastStack, ExitPopup, StickyBar, FEED */
const { useState: appState, useEffect: appEffect, useRef: appRef } = React;

function App() {
  const [inquiry, setInquiry] = appState({ open: false, prefill: null });
  const [toasts, setToasts] = appState([]);
  const [exit, setExit] = appState(false);
  const exitShown = appRef(false);
  const tid = appRef(0);

  const pushToast = (msg, icon) => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const api = {
    inquiry: (prefill = null) => setInquiry({ open: true, prefill }),
    toast: pushToast,
  };

  // recently-enquired feed
  appEffect(() => {
    let i = 0;
    const first = setTimeout(function loop() {
      const f = FEED[i % FEED.length]; i += 1;
      pushToast(`${f.name} just enquired about ${f.place}`, null);
      tid.timer = setTimeout(loop, 9000 + Math.random() * 6000);
    }, 4500);
    return () => clearTimeout(first);
  }, []);

  // exit intent (desktop mouse-leave) + mobile fallback timer
  appEffect(() => {
    const trigger = () => { if (!exitShown.current) { exitShown.current = true; setExit(true); } };
    const onLeave = (e) => { if (e.clientY <= 0) trigger(); };
    document.addEventListener('mouseout', onLeave);
    const t = setTimeout(() => { /* mobile fallback */ if (window.matchMedia('(max-width: 768px)').matches) trigger(); }, 30000);
    return () => { document.removeEventListener('mouseout', onLeave); clearTimeout(t); };
  }, []);

  return (
    <React.Fragment>
      <Header api={api} />
      <main>
        <Hero api={api} />
        <StatsBand />
        <Packages api={api} />
        <SpecialPackages api={api} />
        <GroupDepartures api={api} />
        <CabRecommender api={api} />
        <Trekking api={api} />
        <Guides api={api} />
        <Trust api={api} />
        <Contact api={api} />
      </main>
      <Footer api={api} />
      <StickyBar api={api} />
      <ToastStack toasts={toasts} dismiss={dismiss} />
      <InquiryModal open={inquiry.open} prefill={inquiry.prefill} onClose={() => setInquiry({ open: false, prefill: null })} toast={pushToast} />
      <ExitPopup open={exit} onClose={() => setExit(false)} onClaim={() => { setExit(false); api.inquiry({ promo: '₹500 off first booking' }); pushToast('₹500 off applied to your inquiry', 'ph-tag'); }} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
