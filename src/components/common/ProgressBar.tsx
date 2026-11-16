import { View } from 'react-native';
import { TONES, type Tone } from '../../theme/tones';

type Props = {
  value: number; // 0..1
  tone?: Tone;
  /** على بطاقة بيضاء */
  onLight?: boolean;
};

export default function ProgressBar({ value, tone = 'warning', onLight = false }: Props) {
  const pct = Math.min(1, Math.max(0, value)) * 100;

  return (
    <View className={`h-1.5 w-full overflow-hidden rounded-full ${onLight ? 'bg-surface-2' : 'bg-card-2'}`}>
      <View className={`h-full rounded-full ${TONES[tone].bar}`} style={{ width: `${pct}%` }} />
    </View>
  );
}
