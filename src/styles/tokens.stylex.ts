import * as stylex from '@stylexjs/stylex'

/** Theme colors shared by every component. */
export const colors = stylex.defineVars({
  bg: '#f1f5f9',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  accent: '#4f46e5',
  accentSoft: '#eef2ff',
  danger: '#dc2626',
  dangerBorder: '#fecaca',
  warnSoft: '#fef3c7',
})

/** Corner radii. */
export const radii = stylex.defineConsts({
  sm: '6px',
  md: '8px',
})

/** Shadows for floating surfaces. */
export const shadows = stylex.defineConsts({
  raised: '0 1px 3px rgb(15 23 42 / 0.15)',
  subtle: '0 1px 2px rgb(15 23 42 / 0.12)',
})

/** App-wide media queries. */
export const breakpoints = stylex.defineConsts({
  compact: '@media (max-width: 900px)',
})
