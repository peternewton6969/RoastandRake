import { useEffect } from 'react';
import { HOW_TO } from '../utils/gameRules.js';

// "How To Play" modal shown from the info (ⓘ) icons on the Round Setup games, plus
// the shared modal shell/styles reused by the Score Entry rules quick-reference.
// Rule text comes from the shared HOW_TO source in utils/gameRules.js.

const C = {
  surface2: '#162d4a',
  green: '#22c55e',
  border: '#2d4a6b',
  text: '#f8fafc',
  dim: '#94a3b8',
};

export { HOW_TO };

// Shared modal styling — reused by GameInfoModal and RoundRulesModal so both
// screens present identical chrome and typography (the "same source" for rules UI).
export const rulesModalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    maxHeight: '80vh',
    overflowY: 'auto',
    background: C.surface2,
    border: `1px solid ${C.border}`,
    borderTop: `3px solid ${C.green}`,
    borderRadius: 16,
    padding: '22px 20px',
    boxShadow: '0 14px 44px rgba(0, 0, 0, 0.5)',
  },
  close: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: C.dim,
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
  },
  kicker: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: C.green,
    marginBottom: 4,
  },
  title: { margin: '0 0 12px', fontSize: 22, fontWeight: 900, color: C.text, paddingRight: 36 },
  sectionTitle: { margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: C.green },
  body: { margin: 0, fontSize: 15, lineHeight: 1.6, color: C.text },
  rule: { border: 'none', borderTop: `1px solid ${C.border}`, margin: '18px 0' },
};

/**
 * Reusable rules-modal shell: dark card with a green accent top border, a top-right
 * ✕ close, backdrop-tap + Escape close, and a background scroll lock while open.
 * @param {{ open: boolean, ariaLabel: string, onClose: () => void, children: React.ReactNode }} props
 */
export function RulesModalShell({ open, ariaLabel, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={rulesModalStyles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div style={rulesModalStyles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" style={rulesModalStyles.close} aria-label="Close" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

/**
 * @param {{ gameKey: string|null, onClose: () => void }} props
 * Renders nothing when gameKey is null/unknown.
 */
export default function GameInfoModal({ gameKey, onClose }) {
  const info = gameKey ? HOW_TO[gameKey] : null;
  return (
    <RulesModalShell
      open={!!info}
      ariaLabel={info ? `How to play ${info.title}` : ''}
      onClose={onClose}
    >
      {info && (
        <>
          <span style={rulesModalStyles.kicker}>How to play</span>
          <h2 style={rulesModalStyles.title}>{info.title}</h2>
          <p style={rulesModalStyles.body}>{info.body}</p>
        </>
      )}
    </RulesModalShell>
  );
}
