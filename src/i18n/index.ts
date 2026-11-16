import { Alert, type AlertButton } from 'react-native';
import { EN } from './en';
import { CAR_BRANDS } from '../data/carCatalog';
import { PART_BRANDS } from '../data/partsCatalog';

export type Lang = 'ar' | 'en';

// اللغة الحالية — تتحدد من الإعدادات أول ما يفتح التطبيق
let current: Lang = 'ar';
export const getLang = () => current;
export const setLang = (l: Lang) => {
  current = l;
};

// أسماء الماركات: عربي -> إنجليزي من القوائم مباشرة
const BRANDS: Record<string, string> = {};
for (const b of CAR_BRANDS) BRANDS[b.ar] = b.en;
for (const list of Object.values(PART_BRANDS)) for (const b of list) BRANDS[b.ar] = b.en;

const DICT: Record<string, string> = { ...BRANDS, ...EN };

// النصوص اللي فيها {0}: نحوّلها لأنماط
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERNS = Object.entries(EN)
  .filter(([k]) => /\{\d\}/.test(k))
  .map(([k, v]) => {
    const order: number[] = [];
    const src = escape(k).replace(/\\\{(\d)\\\}/g, (_, n) => {
      order.push(Number(n));
      return '(.+?)';
    });
    return { re: new RegExp(`^${src}$`, 's'), order, out: v };
  })
  // الأنماط الأطول أدق — نجربها أول
  .sort((a, b) => b.re.source.length - a.re.source.length);

const AR = /[؀-ۿ]/;

function translateCore(s: string, depth = 0): string {
  if (!AR.test(s) || depth > 4) return s;
  const hit = DICT[s];
  if (hit !== undefined) return hit;

  for (const p of PATTERNS) {
    const m = s.match(p.re);
    if (m) {
      const vals: string[] = [];
      p.order.forEach((n, i) => (vals[n] = translateCore(m[i + 1], depth + 1)));
      return p.out.replace(/\{(\d)\}/g, (_, n) => vals[Number(n)] ?? '');
    }
  }
  // "تويوتا · 2024" أو "الزيت · بعد 300 كم": نترجم كل جزء
  for (const sep of [' · ', '، ', ' — ']) {
    if (s.includes(sep)) return s.split(sep).map((x) => translateCore(x, depth + 1)).join(sep === '، ' ? ', ' : sep);
  }
  if (__DEV__ && depth === 0) console.warn('[i18n] no English for:', s);
  return s;
}

/** يترجم النص للغة الحالية (العربي يرجع مثل ما هو) */
export function tr(s: string | undefined | null): string {
  if (s == null) return '';
  if (current === 'ar') return s;
  const lead = s.match(/^\s*/)![0];
  const trail = s.match(/\s*$/)![0];
  const core = s.trim();
  return core ? lead + translateCore(core) + trail : s;
}

/** Alert مترجم */
export function alertT(title: string, message?: string, buttons?: AlertButton[]) {
  Alert.alert(tr(title), message ? tr(message) : undefined, buttons?.map((b) => ({ ...b, text: b.text ? tr(b.text) : b.text })));
}
