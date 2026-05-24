export const Timeouts = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 15000,        // Reduced from 30s to 15s for faster test failure feedback
  EXTRA_LONG: 30000,  // Reduced from 60s to 30s
  ANIMATION: 500,
  TOAST: 3000,
} as const;
