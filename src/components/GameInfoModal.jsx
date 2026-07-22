import { useEffect } from 'react';

// "How To Play" modal shown from the info (ⓘ) icons on the Round Setup games.
// Plain-language rules for each game, keyed by the same game keys RoundSetup uses.

const C = {
  surface2: '#162d4a',
  green: '#22c55e',
  border: '#2d4a6b',
  text: '#f8fafc',
  dim: '#94a3b8',
};

// Titles + rules copy. Keys match RoundSetup's TEAM/INDIVIDUAL/JUNK game keys.
export const HOW_TO = {
  bestBall: {
    title: 'Best Ball',
    body:
      'Two-player teams. Each player plays their own ball. The lower net score of the two ' +
      'teammates counts as the team score on each hole. Best team score wins the hole. Most ' +
      'holes won wins the match.',
  },
  scramble: {
    title: 'Scramble',
    body:
      'Two-player teams. Both players tee off. The team picks the best shot and both play from ' +
      'that spot. Repeat until holed out. One team score per hole. Lowest score wins.',
  },
  skins: {
    title: 'Skins',
    body:
      'Every hole is worth one skin. Lowest net score on the hole wins the skin. If two or more ' +
      'players tie, the skin carries to the next hole. Player with the most skins at the end wins ' +
      'the pot.',
  },
  wolf: {
    title: 'Wolf',
    body:
      'One player is the Wolf each hole, rotating each tee box. The Wolf watches each player hit, ' +
      'then decides after each shot whether to pick that player as a partner. If the Wolf goes ' +
      'alone and wins the hole, they collect double. If the Wolf loses alone, they pay double. ' +
      'The Wolf can also declare Lone Wolf before anyone hits.',
  },
  snake: {
    title: 'Snake',
    body:
      'Nobody wants the snake. Three-putt and you hold it. Someone else three-putts and it passes ' +
      'to them. Whoever holds the snake at the end of the round pays every other player the snake ' +
      'amount. No three-putts all round means no payout.',
  },
  greenie: {
    title: 'Greenie',
    body:
      'Par 3 holes only. Closest to the pin on the tee shot wins the greenie — but only if ' +
      'that player makes par or better. No par, no greenie. One winner per par 3 hole.',
  },
  sandy: {
    title: 'Sandy',
    body:
      'Hit it in the bunker and still make par or better net and you collect a sandy from every ' +
      'other player. One sandy per hole regardless of how many bunkers you visit.',
  },
  netBirdie: {
    title: 'Net Birdie',
    body:
      'Make a net birdie — one under par after strokes — and collect from every player ' +
      'who did not. Multiple players can win on the same hole.',
  },
  netEagle: {
    title: 'Net Eagle',
    body:
      'Make a net eagle — two under par after strokes — and collect from every player ' +
      'who did not. Supersedes net birdie on the same hole.',
  },
};

const styles = {
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
  body: { margin: 0, fontSize: 15, lineHeight: 1.6, color: C.text },
};

/**
 * @param {{ gameKey: string|null, onClose: () => void }} props
 * Renders nothing when gameKey is null/unknown. Closes on Escape, backdrop tap,
 * and the top-right ✕. Locks background scroll while open.
 */
export default function GameInfoModal({ gameKey, onClose }) {
  useEffect(() => {
    if (!gameKey) return undefined;
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
  }, [gameKey, onClose]);

  if (!gameKey) return null;
  const info = HOW_TO[gameKey];
  if (!info) return null;

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`How to play ${info.title}`}
    >
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" style={styles.close} aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <span style={styles.kicker}>How to play</span>
        <h2 style={styles.title}>{info.title}</h2>
        <p style={styles.body}>{info.body}</p>
      </div>
    </div>
  );
}
