/**
 * RFQ status transition table (Phase 3 §14) — deliberately loose, not a
 * full workflow engine. SALES must follow this table; ADMIN may set any
 * status ("override where reasonable" — full access per Phase 3 §3).
 */
const OPEN_STATES = ["NEW", "IN_PROGRESS", "QUOTED", "NEGOTIATING"];

const TRANSITIONS = {
  NEW: ["IN_PROGRESS", "LOST", "CANCELLED"],
  IN_PROGRESS: ["QUOTED", "LOST", "CANCELLED"],
  QUOTED: ["NEGOTIATING", "WON", "LOST", "CANCELLED"],
  NEGOTIATING: ["QUOTED", "WON", "LOST", "CANCELLED"],
  WON: [],
  LOST: [],
  CANCELLED: [],
};

function isTransitionAllowed(from, to, { override = false } = {}) {
  if (from === to) return true;
  if (override) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

module.exports = { OPEN_STATES, TRANSITIONS, isTransitionAllowed };
