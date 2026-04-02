export type HabitColor = 'indigo' | 'rose' | 'amber' | 'cyan' | 'violet' | 'orange' | 'teal' | 'pink';

export interface ColorConfig {
  name: string;
  bg: string;       // button / progress bar fill
  bgHover: string;  // button hover
  swatch: string;   // swatch preview color
}

export const HABIT_COLORS: Record<HabitColor, ColorConfig> = {
  indigo:  { name: 'Indigo',  bg: '#4f46e5', bgHover: '#6366f1', swatch: '#4f46e5' },
  violet:  { name: 'Violet',  bg: '#7c3aed', bgHover: '#8b5cf6', swatch: '#7c3aed' },
  rose:    { name: 'Rose',    bg: '#e11d48', bgHover: '#f43f5e', swatch: '#e11d48' },
  pink:    { name: 'Pink',    bg: '#db2777', bgHover: '#ec4899', swatch: '#db2777' },
  orange:  { name: 'Orange',  bg: '#ea580c', bgHover: '#f97316', swatch: '#ea580c' },
  amber:   { name: 'Amber',   bg: '#d97706', bgHover: '#f59e0b', swatch: '#d97706' },
  teal:    { name: 'Teal',    bg: '#0d9488', bgHover: '#14b8a6', swatch: '#0d9488' },
  cyan:    { name: 'Cyan',    bg: '#0891b2', bgHover: '#06b6d4', swatch: '#0891b2' },
};

export const COLOR_KEYS = Object.keys(HABIT_COLORS) as HabitColor[];

export function getColorConfig(color?: string): ColorConfig {
  if (color && color in HABIT_COLORS) return HABIT_COLORS[color as HabitColor];
  return HABIT_COLORS.indigo;
}
