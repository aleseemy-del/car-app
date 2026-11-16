import { getLang } from '../i18n';

/** 48250 -> "48,250" */
export const formatNumber = (n: number) =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 12.5 -> "12.5" ، 12 -> "12" */
export const formatKwd = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2).replace(/0$/, '')} د.ك`;

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
export const monthName = (m: number) => MONTHS[m];

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-02" -> "2 سبتمبر 2026" أو "Sep 2, 2026" (بدون Intl عشان يشتغل على Hermes) */
export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return getLang() === 'en' ? `${MONTHS_EN[m - 1]} ${d}, ${y}` : `${d} ${MONTHS[m - 1]} ${y}`;
};

/** Date -> "YYYY-MM-DD" بالتوقيت المحلي */
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** عدد الأيام من اليوم إلى تاريخ (سالب إذا فات) */
export const daysUntil = (iso: string, today = new Date()) => {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((target - base) / 86400000);
};

export const isValidISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

/** يحوّل الكيلومتر للوحدة المختارة */
export const distance = (km: number, unit: 'km' | 'mi') =>
  unit === 'km' ? `${formatNumber(km)} كم` : `${formatNumber(km * 0.621371)} ميل`;
