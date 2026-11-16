// ألوان الحالات — أسماء الكلاسات كاملة عشان Tailwind يلتقطها
export type Tone = 'good' | 'warning' | 'critical' | 'neutral';

export const TONES: Record<Tone, { hex: string; box: string; text: string; bar: string }> = {
  good: { hex: '#22C55E', box: 'bg-status-good/15', text: 'text-status-good', bar: 'bg-status-good' },
  warning: { hex: '#FF7A1A', box: 'bg-accent/15', text: 'text-accent', bar: 'bg-accent' },
  critical: { hex: '#FF453A', box: 'bg-status-critical/15', text: 'text-status-critical', bar: 'bg-status-critical' },
  neutral: { hex: '#FFFFFF', box: 'bg-card-2', text: 'text-muted', bar: 'bg-accent' },
};

export const COLORS = {
  canvas: '#0B0B0C',
  ink: '#0B0B0C',
  white: '#FFFFFF',
  muted: '#8E8E93',
  gray: '#52525B',
  accent: '#FF7A1A',
  line: '#2C2C30',
};
