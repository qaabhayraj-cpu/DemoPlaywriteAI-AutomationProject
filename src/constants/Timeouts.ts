export const Timeouts = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,        // 30s — public demo site is slow on CI runners
  EXTRA_LONG: 75000,  // 75s — navigation and heavy operations (demo host spikes)
  ANIMATION: 500,
  TOAST: 3000,
} as const;
