import { Fragment } from 'react';
import { RulesModalShell, rulesModalStyles as S } from './GameInfoModal.jsx';
import { activeRules } from '../utils/gameRules.js';

// Quick-reference rules modal for the Score Entry screen. Shows a section for each
// game active in the current round, in setup order, pulling the exact rule text from
// the shared HOW_TO source used by the per-game "How To Play" modals.

/**
 * @param {{ open: boolean, games: Object, onClose: () => void }} props
 */
export default function RoundRulesModal({ open, games, onClose }) {
  const rules = activeRules(games);
  return (
    <RulesModalShell open={open} ariaLabel="Rules for this round" onClose={onClose}>
      <span style={S.kicker}>Rules</span>
      <h2 style={S.title}>This Round</h2>
      {rules.length === 0 ? (
        <p style={S.body}>No games are active for this round.</p>
      ) : (
        rules.map((info, i) => (
          <Fragment key={info.title}>
            {i > 0 && <hr style={S.rule} />}
            <h3 style={S.sectionTitle}>{info.title}</h3>
            <p style={S.body}>{info.body}</p>
          </Fragment>
        ))
      )}
    </RulesModalShell>
  );
}
