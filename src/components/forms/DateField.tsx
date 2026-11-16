import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import PickerSheet, { type PickerItem } from './PickerSheet';
import { monthName } from '../../utils/format';

type Props = {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  /** سنوات للاختيار — افتراضياً من 15 سنة قبل لين سنتين بعد */
  fromYear?: number;
  toYear?: number;
  error?: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();

/** اختيار تاريخ: يوم · شهر · سنة — بدون كتابة */
export default function DateField({ label, value, onChange, fromYear, toYear, error }: Props) {
  const [y, m, d] = value.split('-').map(Number);
  const [sheet, setSheet] = useState<'d' | 'm' | 'y' | null>(null);
  const now = new Date().getFullYear();
  const years = Array.from({ length: (toYear ?? now + 2) - (fromYear ?? now - 15) + 1 }, (_, i) => (toYear ?? now + 2) - i);

  const set = (ny: number, nm: number, nd: number) => onChange(`${ny}-${pad(nm)}-${pad(Math.min(nd, daysIn(ny, nm)))}`);

  const items: Record<'d' | 'm' | 'y', PickerItem[]> = {
    d: Array.from({ length: daysIn(y, m) }, (_, i) => ({ key: String(i + 1), label: String(i + 1) })),
    m: Array.from({ length: 12 }, (_, i) => ({ key: String(i + 1), label: monthName(i), sub: String(i + 1) })),
    y: years.map((v) => ({ key: String(v), label: String(v) })),
  };

  const Box = ({ k, text, flex }: { k: 'd' | 'm' | 'y'; text: string; flex: number }) => (
    <Pressable onPress={() => setSheet(k)} style={{ flex }} className={`h-12 items-center justify-center rounded-tile bg-card active:opacity-80 ${error ? 'border border-status-critical' : ''}`}>
      <Text className="text-base text-white">{text}</Text>
    </Pressable>
  );

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm text-muted">{label}</Text>
      <View className="flex-row" style={{ gap: 8 }}>
        <Box k="d" text={String(d)} flex={1} />
        <Box k="m" text={monthName(m - 1)} flex={2} />
        <Box k="y" text={String(y)} flex={1.3} />
      </View>
      {error && <Text className="mt-1 text-xs text-status-critical">{error}</Text>}

      {(['d', 'm', 'y'] as const).map((k) => (
        <PickerSheet
          key={k}
          visible={sheet === k}
          title={k === 'd' ? 'اليوم' : k === 'm' ? 'الشهر' : 'السنة'}
          items={items[k]}
          selectedKey={String(k === 'd' ? d : k === 'm' ? m : y)}
          onSelect={(it) => {
            const n = Number(it.key);
            if (k === 'd') set(y, m, n);
            else if (k === 'm') set(y, n, d);
            else set(n, m, d);
          }}
          onClose={() => setSheet(null)}
        />
      ))}
    </View>
  );
}
