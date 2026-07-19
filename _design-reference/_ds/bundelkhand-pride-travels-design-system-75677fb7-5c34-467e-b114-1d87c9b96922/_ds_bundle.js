/* @ds-bundle: {"format":4,"namespace":"BundelkhandPrideTravelsDesignSystem_75677f","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Tag","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/Button.jsx"},{"name":"RatingStars","sourcePath":"components/core/RatingAvatar.jsx"},{"name":"RatingAvatar","sourcePath":"components/core/RatingAvatar.jsx"},{"name":"Avatar","sourcePath":"components/core/RatingAvatar.jsx"},{"name":"Modal","sourcePath":"components/feedback/Overlays.jsx"},{"name":"Toast","sourcePath":"components/feedback/Overlays.jsx"},{"name":"Overlays","sourcePath":"components/feedback/Overlays.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Overlays.jsx"},{"name":"FieldLabel","sourcePath":"components/forms/TextFields.jsx"},{"name":"Input","sourcePath":"components/forms/TextFields.jsx"},{"name":"Textarea","sourcePath":"components/forms/TextFields.jsx"},{"name":"TextFields","sourcePath":"components/forms/TextFields.jsx"},{"name":"Select","sourcePath":"components/forms/TextFields.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Toggles.jsx"},{"name":"Radio","sourcePath":"components/forms/Toggles.jsx"},{"name":"Toggles","sourcePath":"components/forms/Toggles.jsx"},{"name":"Switch","sourcePath":"components/forms/Toggles.jsx"},{"name":"Card","sourcePath":"components/layout/CardTabsAccordion.jsx"},{"name":"Tabs","sourcePath":"components/layout/CardTabsAccordion.jsx"},{"name":"CardTabsAccordion","sourcePath":"components/layout/CardTabsAccordion.jsx"},{"name":"Accordion","sourcePath":"components/layout/CardTabsAccordion.jsx"},{"name":"Navbar","sourcePath":"components/navigation/NavFooter.jsx"},{"name":"NavFooter","sourcePath":"components/navigation/NavFooter.jsx"},{"name":"Footer","sourcePath":"components/navigation/NavFooter.jsx"},{"name":"BookingWidget","sourcePath":"components/travel/BookingWidget.jsx"},{"name":"PriceBlock","sourcePath":"components/travel/PriceMeterCountdown.jsx"},{"name":"SeatsLeftMeter","sourcePath":"components/travel/PriceMeterCountdown.jsx"},{"name":"PriceMeterCountdown","sourcePath":"components/travel/PriceMeterCountdown.jsx"},{"name":"CountdownTimer","sourcePath":"components/travel/PriceMeterCountdown.jsx"},{"name":"PackageCard","sourcePath":"components/travel/TravelCards.jsx"},{"name":"TravelCards","sourcePath":"components/travel/TravelCards.jsx"},{"name":"DepartureCard","sourcePath":"components/travel/TravelCards.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"3d2227d38c99","components/core/Button.jsx":"2a61e9a96149","components/core/RatingAvatar.jsx":"897a6bb56cdf","components/feedback/Overlays.jsx":"f6f1bebed88a","components/forms/TextFields.jsx":"4315ee55274b","components/forms/Toggles.jsx":"66be814e01d3","components/layout/CardTabsAccordion.jsx":"deff3833a495","components/navigation/NavFooter.jsx":"0c6be9984659","components/travel/BookingWidget.jsx":"bc4179542c18","components/travel/PriceMeterCountdown.jsx":"f4cdad9c931c","components/travel/TravelCards.jsx":"79806cd73739","ui_kits/marketing/EnquiryModal.jsx":"c67081c1b759","ui_kits/marketing/Hero.jsx":"cbbc6c23a89b","ui_kits/marketing/ListingFilters.jsx":"d574773d8108","ui_kits/marketing/PackageDetailSections.jsx":"5fe218a828c1"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BundelkhandPrideTravelsDesignSystem_75677f = window.BundelkhandPrideTravelsDesignSystem_75677f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const tones = {
  neutral: {
    bg: 'var(--surface-sunken)',
    fg: 'var(--ink-700)'
  },
  primary: {
    bg: 'var(--color-primary-soft)',
    fg: 'var(--color-primary)'
  },
  energy: {
    bg: 'var(--color-energy-soft)',
    fg: '#8A6600'
  },
  success: {
    bg: 'var(--color-success-soft)',
    fg: 'var(--green-600)'
  },
  error: {
    bg: 'var(--color-error-soft)',
    fg: 'var(--red-600)'
  },
  premium: {
    bg: 'var(--gold-300)',
    fg: '#6B4E0E'
  }
};
function Badge({
  children,
  tone = 'neutral',
  icon = null
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      padding: '5px 12px',
      borderRadius: 'var(--radius-pill)'
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    style: {
      fontSize: '12px'
    }
  }), children);
}
function Tag({
  children,
  selected = false,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      padding: '8px 16px',
      borderRadius: 'var(--radius-pill)',
      border: selected ? '1px solid var(--color-primary)' : '1px solid var(--border)',
      background: selected ? 'var(--color-primary-soft)' : 'var(--surface-raised)',
      color: selected ? 'var(--color-primary)' : 'var(--ink-700)',
      cursor: 'pointer',
      transition: 'all var(--duration-fast) var(--ease-standard)'
    }
  }, children);
}
Object.assign(__ds_scope, { Badge, Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const sizeStyles = {
  sm: {
    padding: '8px 16px',
    fontSize: 'var(--text-sm)'
  },
  md: {
    padding: '12px 22px',
    fontSize: 'var(--text-base)'
  },
  lg: {
    padding: '15px 28px',
    fontSize: 'var(--text-md)'
  }
};
const variantStyles = {
  primary: {
    background: 'var(--color-cta)',
    color: '#fff',
    border: '1px solid transparent'
  },
  secondary: {
    background: 'var(--color-primary)',
    color: '#fff',
    border: '1px solid transparent'
  },
  outline: {
    background: 'transparent',
    color: 'var(--ink-900)',
    border: '1px solid var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid transparent'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button'
}) {
  const v = variantStyles[variant] || variantStyles.primary;
  const s = sizeStyles[size] || sizeStyles.md;
  const style = {
    ...v,
    ...s,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
    transition: 'transform var(--duration-fast) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard), background var(--duration-base) var(--ease-standard)',
    boxShadow: variant === 'primary' ? 'var(--shadow-sm)' : 'none'
  };
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: style,
    onMouseEnter: e => {
      if (disabled) return;
      if (variant === 'primary') {
        e.currentTarget.style.background = 'var(--color-cta-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow-cta)';
      }
      if (variant === 'secondary') {
        e.currentTarget.style.background = 'var(--color-primary-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow-primary)';
      }
      if (variant === 'outline') e.currentTarget.style.borderColor = 'var(--color-primary)';
      if (variant === 'ghost') e.currentTarget.style.background = 'var(--color-primary-soft)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    },
    onMouseLeave: e => {
      if (disabled) return;
      if (variant === 'primary') {
        e.currentTarget.style.background = 'var(--color-cta)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }
      if (variant === 'secondary') {
        e.currentTarget.style.background = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = 'none';
      }
      if (variant === 'outline') e.currentTarget.style.borderColor = 'var(--border-strong)';
      if (variant === 'ghost') e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.transform = 'translateY(0)';
    },
    onMouseDown: e => {
      e.currentTarget.style.transform = 'scale(0.98)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  }, icon && iconPosition === 'left' && /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    style: {
      fontSize: '1.15em'
    }
  }), children, icon && iconPosition === 'right' && /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    style: {
      fontSize: '1.15em'
    }
  }));
}
function IconButton({
  icon,
  label,
  size = 40,
  variant = 'ghost',
  onClick,
  active = false
}) {
  const bg = variant === 'filled' ? 'var(--surface-sunken)' : 'transparent';
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    title: label,
    onClick: onClick,
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-circle)',
      border: 'none',
      background: bg,
      color: active ? 'var(--color-love)' : 'var(--ink-700)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background var(--duration-base) var(--ease-standard), transform var(--duration-fast) var(--ease-bounce)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--surface-sunken)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = bg;
    },
    onMouseDown: e => {
      e.currentTarget.style.transform = 'scale(0.9)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ${active ? icon.replace('ph-', 'ph-fill ph-') : icon}`,
    style: {
      fontSize: size * 0.5
    }
  }));
}
Object.assign(__ds_scope, { Button, IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/RatingAvatar.jsx
try { (() => {
function RatingStars({
  value = 5,
  count = null,
  size = 14
}) {
  const stars = [1, 2, 3, 4, 5];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: '1px'
    }
  }, stars.map(s => /*#__PURE__*/React.createElement("i", {
    key: s,
    className: s <= Math.round(value) ? 'ph-fill ph-star' : 'ph ph-star',
    style: {
      fontSize: size,
      color: s <= Math.round(value) ? 'var(--color-energy)' : 'var(--border-strong)'
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--ink-900)'
    }
  }, value.toFixed(1)), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-500)'
    }
  }, "(", count, ")"));
}
const RatingAvatar = {
  name: 'RatingAvatar'
};
function Avatar({
  name,
  src = null,
  size = 40
}) {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';
  return src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    width: size,
    height: size,
    style: {
      borderRadius: '50%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-primary-soft)',
      color: 'var(--color-primary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.38
    }
  }, initials);
}
Object.assign(__ds_scope, { RatingStars, RatingAvatar, Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/RatingAvatar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Overlays.jsx
try { (() => {
function Modal({
  open,
  onClose,
  title,
  children,
  footer = null
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(11,32,56,0.5)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      width: 'min(480px, 92vw)',
      maxHeight: '86vh',
      overflow: 'auto',
      padding: 'var(--space-8)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      color: 'var(--ink-900)',
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: 'none',
      background: 'var(--surface-sunken)',
      width: 32,
      height: 32,
      borderRadius: '50%',
      cursor: 'pointer',
      color: 'var(--ink-700)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x"
  }))), /*#__PURE__*/React.createElement("div", null, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)'
    }
  }, footer)));
}
function Toast({
  tone = 'success',
  icon = 'ph-check-circle',
  children,
  onClose
}) {
  const toneColor = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    info: 'var(--color-primary)'
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--surface-dark)',
      color: 'var(--ink-on-dark)',
      padding: '14px 18px',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph-fill ${icon}`,
    style: {
      color: toneColor,
      fontSize: 20,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Dismiss",
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--ink-on-dark-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x"
  })));
}
const Overlays = {
  name: 'Overlays'
};
function Tooltip({
  label,
  children
}) {
  const [show, setShow] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: '125%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--surface-dark-2)',
      color: '#fff',
      padding: '6px 10px',
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-body)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 10
    }
  }, label));
}
Object.assign(__ds_scope, { Modal, Toast, Overlays, Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Overlays.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextFields.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fieldBase = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  color: 'var(--ink-900)',
  background: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 14px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)'
};
function useFocusRing() {
  return {
    onFocus: e => {
      e.currentTarget.style.borderColor = 'var(--border-focus)';
      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };
}
function FieldLabel({
  children,
  htmlFor
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      display: 'block',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--ink-900)',
      marginBottom: '6px'
    }
  }, children);
}
function Input({
  id,
  placeholder,
  icon = null,
  type = 'text',
  value,
  onChange,
  error = null
}) {
  const focus = useFocusRing();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    style: {
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--ink-500)'
    }
  }), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    style: {
      ...fieldBase,
      paddingLeft: icon ? 40 : 14,
      borderColor: error ? 'var(--color-error)' : 'var(--border)'
    }
  }, focus))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--color-error)',
      fontSize: 'var(--text-xs)',
      marginTop: 4
    }
  }, error));
}
function Textarea({
  id,
  placeholder,
  rows = 4,
  value,
  onChange
}) {
  const focus = useFocusRing();
  return /*#__PURE__*/React.createElement("textarea", _extends({
    id: id,
    placeholder: placeholder,
    rows: rows,
    value: value,
    onChange: onChange,
    style: {
      ...fieldBase,
      resize: 'vertical',
      fontFamily: 'var(--font-body)'
    }
  }, focus));
}
const TextFields = {
  name: 'TextFields'
};
function Select({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select'
}) {
  const focus = useFocusRing();
  return /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    value: value,
    onChange: onChange,
    style: {
      ...fieldBase,
      appearance: 'none',
      cursor: 'pointer'
    }
  }, focus), /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)));
}
Object.assign(__ds_scope, { FieldLabel, Input, Textarea, TextFields, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextFields.jsx", error: String((e && e.message) || e) }); }

// components/forms/Toggles.jsx
try { (() => {
function Checkbox({
  checked,
  onChange,
  label,
  id
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      color: 'var(--ink-900)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--border-strong)'}`,
      background: checked ? 'var(--color-primary)' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all var(--duration-fast) var(--ease-standard)',
      flexShrink: 0
    }
  }, checked && /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check",
    style: {
      color: '#fff',
      fontSize: 13
    }
  })), label);
}
function Radio({
  checked,
  onChange,
  label,
  id,
  name
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      color: 'var(--ink-900)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "radio",
    name: name,
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: '50%',
      border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--border-strong)'}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all var(--duration-fast) var(--ease-standard)'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: 'var(--color-primary)'
    }
  })), label);
}
const Toggles = {
  name: 'Toggles'
};
function Switch({
  checked,
  onChange,
  label,
  id
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      color: 'var(--ink-900)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 24,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--color-success)' : 'var(--neutral-400)',
      position: 'relative',
      transition: 'background var(--duration-base) var(--ease-standard)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 18 : 2,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-xs)',
      transition: 'left var(--duration-base) var(--ease-bounce)'
    }
  })), label);
}
Object.assign(__ds_scope, { Checkbox, Radio, Toggles, Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Toggles.jsx", error: String((e && e.message) || e) }); }

// components/layout/CardTabsAccordion.jsx
try { (() => {
function Card({
  children,
  padding = 'var(--space-6)',
  hoverLift = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding,
      transition: 'box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)',
      ...style
    },
    onMouseEnter: hoverLift ? e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      e.currentTarget.style.transform = 'translateY(-3px)';
    } : undefined,
    onMouseLeave: hoverLift ? e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    } : undefined
  }, children);
}
function Tabs({
  tabs,
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--font-body)'
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    onClick: () => onChange(t.value),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '12px 18px',
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: active === t.value ? 'var(--color-primary)' : 'var(--ink-500)',
      borderBottom: active === t.value ? '2px solid var(--color-primary)' : '2px solid transparent',
      marginBottom: -1
    }
  }, t.label)));
}
const CardTabsAccordion = {
  name: 'CardTabsAccordion'
};
function Accordion({
  items
}) {
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderTop: i === 0 ? 'none' : '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(open === i ? -1 : i),
    style: {
      width: '100%',
      textAlign: 'left',
      background: 'var(--surface-raised)',
      border: 'none',
      cursor: 'pointer',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: 'var(--ink-900)'
    }
  }, item.title, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down",
    style: {
      transition: 'transform var(--duration-base) var(--ease-standard)',
      transform: open === i ? 'rotate(180deg)' : 'rotate(0)'
    }
  })), open === i && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px 16px',
      color: 'var(--ink-700)',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, item.content))));
}
Object.assign(__ds_scope, { Card, Tabs, CardTabsAccordion, Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/CardTabsAccordion.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavFooter.jsx
try { (() => {
function Navbar({
  links = ['Holidays', 'Hotels', 'Flights', 'Buses', 'Cabs'],
  active = 'Holidays'
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 32px',
      background: 'var(--surface-raised)',
      boxShadow: 'var(--shadow-xs)',
      fontFamily: 'var(--font-body)',
      gap: 20,
      flexWrap: 'wrap',
      rowGap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 36,
      minWidth: 0,
      flexShrink: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--text-lg)',
      color: 'var(--ink-900)',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, "Bundelkhand ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-cta)'
    }
  }, "Pride"), " Travels"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      flexWrap: 'wrap',
      rowGap: 8
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      textDecoration: 'none',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      color: l === active ? 'var(--color-primary)' : 'var(--ink-700)',
      borderBottom: l === active ? '2px solid var(--color-primary)' : '2px solid transparent',
      paddingBottom: 4
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      textDecoration: 'none',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--ink-700)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-phone"
  }), " +91 98765 43210"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--color-cta)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '9px 20px',
      fontWeight: 600,
      fontSize: 'var(--text-sm)',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, "Enquire now")));
}
const NavFooter = {
  name: 'NavFooter'
};
function Footer() {
  const cols = [{
    title: 'Explore',
    items: ['Himachal', 'Kashmir', 'Uttarakhand', 'Rajasthan', 'Goa', 'Treks']
  }, {
    title: 'Bookings',
    items: ['Hotels', 'Flights', 'Buses', 'Cabs', 'Visa assistance', 'Travel insurance']
  }, {
    title: 'Company',
    items: ['About us', 'Corporate travel', 'B2B agent portal', 'Careers']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-dark)',
      color: 'var(--ink-on-dark-muted)',
      fontFamily: 'var(--font-body)',
      padding: '48px 32px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 64,
      flexWrap: 'wrap',
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 280
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--text-lg)',
      color: '#fff',
      marginBottom: 8
    }
  }, "Bundelkhand ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--yellow-400)'
    }
  }, "Pride"), " Travels"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, "Discover more. Travel better.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontWeight: 700,
      fontSize: 'var(--text-sm)',
      marginBottom: 12,
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase'
    }
  }, c.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, c.items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    style: {
      color: 'var(--ink-on-dark-muted)',
      textDecoration: 'none',
      fontSize: 'var(--text-sm)'
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid rgba(255,255,255,0.12)',
      paddingTop: 18,
      fontSize: 'var(--text-xs)',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Bundelkhand Pride Travels. All rights reserved."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--ink-on-dark-muted)',
      textDecoration: 'none'
    }
  }, "Terms"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--ink-on-dark-muted)',
      textDecoration: 'none'
    }
  }, "Privacy"))));
}
Object.assign(__ds_scope, { Navbar, NavFooter, Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavFooter.jsx", error: String((e && e.message) || e) }); }

// components/travel/BookingWidget.jsx
try { (() => {
function BookingWidget({
  onSubmit
}) {
  const [adults, setAdults] = React.useState(2);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      padding: 20,
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      width: 320
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-md)',
      color: 'var(--ink-900)'
    }
  }, "Plan your trip"), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--ink-700)'
    }
  }, "Destination", /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-map-pin",
    style: {
      color: 'var(--ink-500)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-900)'
    }
  }, "Manali, Himachal Pradesh"))), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--ink-700)'
    }
  }, "Travel date", /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank",
    style: {
      color: 'var(--ink-500)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-900)'
    }
  }, "18 Jul 2026"))), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--ink-700)'
    }
  }, "Travelers", /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-900)'
    }
  }, adults, " adults"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setAdults(Math.max(1, adults - 1)),
    style: stepperBtn
  }, "\u2212"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAdults(adults + 1),
    style: stepperBtn
  }, "+")))), /*#__PURE__*/React.createElement("button", {
    onClick: onSubmit,
    style: {
      background: 'var(--color-cta)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '13px 0',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 'var(--text-base)',
      marginTop: 4,
      boxShadow: 'var(--shadow-glow-cta)'
    }
  }, "Check availability"));
}
const stepperBtn = {
  width: 26,
  height: 26,
  borderRadius: '50%',
  border: '1px solid var(--border-strong)',
  background: 'var(--surface-raised)',
  cursor: 'pointer',
  fontSize: 16,
  color: 'var(--ink-900)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1
};
Object.assign(__ds_scope, { BookingWidget });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/travel/BookingWidget.jsx", error: String((e && e.message) || e) }); }

// components/travel/PriceMeterCountdown.jsx
try { (() => {
function PriceBlock({
  startingFrom,
  price,
  perPerson = true,
  strikePrice = null
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)'
    }
  }, startingFrom && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-500)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "Starting from"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, strikePrice && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-500)',
      textDecoration: 'line-through'
    }
  }, "\u20B9", strikePrice.toLocaleString('en-IN')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      color: 'var(--ink-900)'
    }
  }, "\u20B9", price.toLocaleString('en-IN')), perPerson && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-500)'
    }
  }, "/ person")));
}
function SeatsLeftMeter({
  seatsLeft,
  totalSeats = 20
}) {
  const urgent = seatsLeft <= 6;
  const pct = Math.max(6, Math.min(100, seatsLeft / totalSeats * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--text-xs)',
      marginBottom: 4,
      color: urgent ? 'var(--color-cta)' : 'var(--ink-500)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", null, seatsLeft, " seats left")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      background: urgent ? 'var(--color-cta)' : 'var(--color-energy)',
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--duration-slow) var(--ease-standard)'
    }
  })));
}
const PriceMeterCountdown = {
  name: 'PriceMeterCountdown'
};
function CountdownTimer({
  label = 'Offer ends in',
  hours = 18,
  minutes = 42
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-700)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-timer",
    style: {
      color: 'var(--color-cta)'
    }
  }), label, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      color: 'var(--ink-900)',
      background: 'var(--surface-sunken)',
      padding: '3px 8px',
      borderRadius: 6
    }
  }, String(hours).padStart(2, '0'), ":", String(minutes).padStart(2, '0')));
}
Object.assign(__ds_scope, { PriceBlock, SeatsLeftMeter, PriceMeterCountdown, CountdownTimer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/travel/PriceMeterCountdown.jsx", error: String((e && e.message) || e) }); }

// components/travel/TravelCards.jsx
try { (() => {
function PackageCard({
  image,
  destination,
  name,
  hotelCategory,
  duration,
  price,
  strikePrice,
  seatsLeft,
  rating,
  reviewCount,
  tags = [],
  onBook,
  onEnquire,
  onWishlist,
  wishlisted = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      width: 300,
      transition: 'box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)',
      display: 'flex',
      flexDirection: 'column'
    },
    onMouseEnter: e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      e.currentTarget.style.transform = 'translateY(-3px)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 180,
      background: image || 'linear-gradient(135deg, var(--sky-400), var(--yellow-300))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(11,32,56,.5), transparent 55%)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onWishlist,
    "aria-label": "Wishlist",
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 'none',
      background: 'rgba(255,255,255,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: wishlisted ? 'ph-fill ph-heart' : 'ph ph-heart',
    style: {
      color: wishlisted ? 'var(--color-love)' : 'var(--ink-700)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: 12,
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-lg)'
    }
  }, destination), tags.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: 'absolute',
      top: 10,
      left: 12 + i * 0,
      background: 'var(--color-energy)',
      color: 'var(--navy-700)',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)'
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--ink-900)',
      fontSize: 'var(--text-base)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-500)'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank"
  }), " ", duration), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-star"
  }), " ", hotelCategory)), rating && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 'var(--text-xs)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      color: 'var(--color-energy)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--ink-900)'
    }
  }, rating), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-500)'
    }
  }, "(", reviewCount, ")")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, strikePrice && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-500)',
      textDecoration: 'line-through'
    }
  }, "\u20B9", strikePrice.toLocaleString('en-IN')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-lg)',
      color: 'var(--ink-900)'
    }
  }, "\u20B9", price.toLocaleString('en-IN')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-500)'
    }
  }, "/ person")), seatsLeft != null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: seatsLeft <= 6 ? 'var(--color-cta)' : 'var(--ink-500)',
      fontWeight: 600
    }
  }, seatsLeft, " seats left"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBook,
    style: {
      flex: 1,
      background: 'var(--color-cta)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '10px 0',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: 'var(--text-sm)'
    }
  }, "Book now"), /*#__PURE__*/React.createElement("button", {
    onClick: onEnquire,
    style: {
      flex: 1,
      background: 'transparent',
      color: 'var(--ink-900)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-pill)',
      padding: '10px 0',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: 'var(--text-sm)'
    }
  }, "Enquire"))));
}
const TravelCards = {
  name: 'TravelCards'
};
function DepartureCard({
  destination,
  schedule,
  badge,
  price,
  seatsLeft,
  onBook
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding: 16,
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      width: 240
    }
  }, badge && /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: 'flex-start',
      background: 'var(--color-energy-soft)',
      color: '#8A6600',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)'
    }
  }, badge), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-md)',
      color: 'var(--ink-900)'
    }
  }, destination), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-700)',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank"
  }), schedule), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: seatsLeft <= 6 ? 'var(--color-cta)' : 'var(--ink-500)',
      fontWeight: 600
    }
  }, seatsLeft, " seats left"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--ink-900)'
    }
  }, "\u20B9", price.toLocaleString('en-IN'), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 400,
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-500)'
    }
  }, "/ person")), /*#__PURE__*/React.createElement("button", {
    onClick: onBook,
    style: {
      background: 'var(--color-cta)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '9px 0',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: 'var(--text-sm)',
      marginTop: 4
    }
  }, "Book with \u20B93,000"));
}
Object.assign(__ds_scope, { PackageCard, TravelCards, DepartureCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/travel/TravelCards.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/EnquiryModal.jsx
try { (() => {
function EnquiryModal({
  open,
  onClose,
  destination = 'Manali'
}) {
  const [submitted, setSubmitted] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: open ? 'flex' : 'none',
      position: 'fixed',
      inset: 0,
      background: 'rgba(11,32,56,0.5)',
      backdropFilter: 'blur(2px)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      width: 'min(440px, 92vw)',
      maxHeight: '88vh',
      overflow: 'auto',
      padding: 'var(--space-8)',
      fontFamily: 'var(--font-body)'
    }
  }, !submitted ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      color: 'var(--ink-900)',
      margin: 0
    }
  }, "Enquire about ", destination), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-500)',
      margin: '4px 0 0'
    }
  }, "We'll call you within 30 minutes.")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: 'none',
      background: 'var(--surface-sunken)',
      width: 32,
      height: 32,
      borderRadius: '50%',
      cursor: 'pointer',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Full name",
    placeholder: "Your name"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Phone number",
    placeholder: "+91 98765 43210",
    icon: "ph-phone"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Travel date",
    placeholder: "Select date",
    icon: "ph-calendar-blank"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Adults",
    placeholder: "2"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Children",
    placeholder: "0"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubmitted(true),
    style: {
      background: 'var(--color-cta)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '13px 0',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 'var(--text-base)',
      marginTop: 6,
      boxShadow: 'var(--shadow-glow-cta)'
    }
  }, "Send enquiry"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--green-600)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-whatsapp-logo"
  }), "WhatsApp instead"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--color-primary)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-phone"
  }), "Call now")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--color-success-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check-circle",
    style: {
      fontSize: 32,
      color: 'var(--color-success)'
    }
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--ink-900)'
    }
  }, "Enquiry sent"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-700)',
      fontSize: 'var(--text-sm)'
    }
  }, "Lead ID ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, "BPT-", destination.slice(0, 3).toUpperCase(), "-0091"), " \u2014 our team will call and confirm on WhatsApp."), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'var(--color-primary)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '10px 24px',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 8
    }
  }, "Done"))));
}
function Field({
  label,
  placeholder,
  icon
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--ink-700)'
    }
  }, label, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      marginTop: 4
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ${icon}`,
    style: {
      color: 'var(--ink-500)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: placeholder,
    style: {
      border: 'none',
      outline: 'none',
      fontSize: 'var(--text-base)',
      fontFamily: 'var(--font-body)',
      width: '100%',
      color: 'var(--ink-900)'
    }
  })));
}
Object.assign(window, {
  EnquiryModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/EnquiryModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Hero.jsx
try { (() => {
function Hero({
  onSearch
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      minHeight: 560,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(120deg, var(--sky-500), var(--sky-300) 55%, var(--yellow-200))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(11,32,56,.55), transparent 60%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      padding: '0 48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      gap: 40,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(255,255,255,0.16)',
      color: '#fff',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      padding: '6px 14px',
      borderRadius: 'var(--radius-pill)',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-shield-check"
  }), " Trusted by 40,000+ travelers"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-5xl)',
      color: '#fff',
      margin: 0,
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "Discover more.", /*#__PURE__*/React.createElement("br", null), "Travel better."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      color: 'rgba(255,255,255,0.92)',
      fontSize: 'var(--text-md)',
      marginTop: 20,
      maxWidth: 460,
      lineHeight: 'var(--leading-relaxed)'
    }
  }, "Holiday packages, hotels, flights, buses and cabs across Himachal, Kashmir, Uttarakhand and beyond \u2014 planned, booked, and confirmed on WhatsApp.")), onSearch));
}
function CategoryRail() {
  const cats = [{
    icon: 'ph-mountains',
    label: 'Himachal'
  }, {
    icon: 'ph-snowflake',
    label: 'Kashmir'
  }, {
    icon: 'ph-tree',
    label: 'Uttarakhand'
  }, {
    icon: 'ph-castle-turret',
    label: 'Rajasthan'
  }, {
    icon: 'ph-umbrella',
    label: 'Goa'
  }, {
    icon: 'ph-person-simple-hike',
    label: 'Treks'
  }, {
    icon: 'ph-heart',
    label: 'Honeymoon'
  }, {
    icon: 'ph-flower-lotus',
    label: 'Spiritual'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      padding: '32px 48px',
      overflowX: 'auto'
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      minWidth: 88,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--color-primary-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ${c.icon}`,
    style: {
      fontSize: 28,
      color: 'var(--color-primary)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--ink-900)'
    }
  }, c.label))));
}
function SectionHeading({
  eyebrow,
  title,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: '0 48px',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      color: 'var(--color-cta)',
      letterSpacing: 'var(--tracking-wider)',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-2xl)',
      color: 'var(--ink-900)',
      margin: 0,
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title)), action);
}
Object.assign(window, {
  Hero,
  CategoryRail,
  SectionHeading
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/ListingFilters.jsx
try { (() => {
function ListingFilters({
  filters,
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      padding: '0 48px 24px'
    }
  }, filters.map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    onClick: () => onChange(f),
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      padding: '9px 18px',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      border: active === f ? '1px solid var(--color-primary)' : '1px solid var(--border)',
      background: active === f ? 'var(--color-primary-soft)' : 'var(--surface-raised)',
      color: active === f ? 'var(--color-primary)' : 'var(--ink-700)'
    }
  }, f)));
}
function SortBar({
  count,
  sort,
  onSort
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 48px 20px',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-700)',
      fontSize: 'var(--text-sm)'
    }
  }, count, " packages found"), /*#__PURE__*/React.createElement("select", {
    value: sort,
    onChange: onSort,
    style: {
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontFamily: 'var(--font-body)',
      color: 'var(--ink-900)',
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("option", null, "Recommended"), /*#__PURE__*/React.createElement("option", null, "Price: low to high"), /*#__PURE__*/React.createElement("option", null, "Price: high to low"), /*#__PURE__*/React.createElement("option", null, "Rating")));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/ListingFilters.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/PackageDetailSections.jsx
try { (() => {
function StickyBookingBar({
  price,
  onBook,
  onEnquire
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      background: 'rgba(255,252,246,0.9)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)',
      padding: '16px 48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'var(--font-body)',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-500)'
    }
  }, "Starting from"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-xl)',
      color: 'var(--ink-900)'
    }
  }, "\u20B9", price.toLocaleString('en-IN'), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 400,
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-500)'
    }
  }, "/ person"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onEnquire,
    style: {
      background: 'transparent',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-pill)',
      padding: '13px 24px',
      fontWeight: 600,
      cursor: 'pointer',
      color: 'var(--ink-900)'
    }
  }, "Enquire"), /*#__PURE__*/React.createElement("button", {
    onClick: onBook,
    style: {
      background: 'var(--color-cta)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '13px 28px',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: 'var(--shadow-glow-cta)'
    }
  }, "Book now")));
}
function Itinerary({
  days
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: 'var(--color-primary)',
      flexShrink: 0,
      marginTop: 4
    }
  }), i < days.length - 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 2,
      flex: 1,
      background: 'var(--border)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--ink-900)',
      fontSize: 'var(--text-md)'
    }
  }, "Day ", i + 1, " \u2014 ", d.title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--ink-700)',
      fontSize: 'var(--text-sm)',
      marginTop: 4,
      lineHeight: 'var(--leading-relaxed)'
    }
  }, d.desc)))));
}
function ReviewCard({
  name,
  rating,
  date,
  text
}) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '16px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'var(--color-primary-soft)',
      color: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      flexShrink: 0
    }
  }, initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--ink-900)',
      fontSize: 'var(--text-sm)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 2
    }
  }, [1, 2, 3, 4, 5].map(s => /*#__PURE__*/React.createElement("i", {
    key: s,
    className: s <= rating ? 'ph-fill ph-star' : 'ph ph-star',
    style: {
      fontSize: 12,
      color: s <= rating ? 'var(--color-energy)' : 'var(--border-strong)'
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-500)'
    }
  }, date)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-700)',
      margin: '6px 0 0',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, text)));
}
Object.assign(window, {
  StickyBookingBar,
  Itinerary,
  ReviewCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/PackageDetailSections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.RatingStars = __ds_scope.RatingStars;

__ds_ns.RatingAvatar = __ds_scope.RatingAvatar;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Overlays = __ds_scope.Overlays;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.FieldLabel = __ds_scope.FieldLabel;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.TextFields = __ds_scope.TextFields;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Toggles = __ds_scope.Toggles;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.CardTabsAccordion = __ds_scope.CardTabsAccordion;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Navbar = __ds_scope.Navbar;

__ds_ns.NavFooter = __ds_scope.NavFooter;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.BookingWidget = __ds_scope.BookingWidget;

__ds_ns.PriceBlock = __ds_scope.PriceBlock;

__ds_ns.SeatsLeftMeter = __ds_scope.SeatsLeftMeter;

__ds_ns.PriceMeterCountdown = __ds_scope.PriceMeterCountdown;

__ds_ns.CountdownTimer = __ds_scope.CountdownTimer;

__ds_ns.PackageCard = __ds_scope.PackageCard;

__ds_ns.TravelCards = __ds_scope.TravelCards;

__ds_ns.DepartureCard = __ds_scope.DepartureCard;

})();
