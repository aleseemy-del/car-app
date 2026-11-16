import { View } from 'react-native';
import Text from '../common/Text';
import ProgressBar from '../common/ProgressBar';
import type { Tone } from '../../theme/tones';

type Props = { label: string; value: number; caption: string; tone: Tone };

/** بطاقة بيضاء فيها نسبة العمر المتبقي */
export default function ProgressCard({ label, value, caption, tone }: Props) {
  return (
    <View className="rounded-card bg-surface p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-ink">{label}</Text>
        <Text className={`text-base font-bold ${tone === 'good' ? 'text-ink' : 'text-accent-ink'}`}>
          {Math.round(value * 100)}٪
        </Text>
      </View>
      <ProgressBar value={value} tone={tone} onLight />
      <Text className="mt-2 text-xs text-muted-ink">{caption}</Text>
    </View>
  );
}
