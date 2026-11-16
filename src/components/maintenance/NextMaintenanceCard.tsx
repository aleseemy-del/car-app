import { I18nManager, View } from 'react-native';
import Text from '../common/Text';
import ProgressBar from '../common/ProgressBar';
import PrimaryButton from '../common/PrimaryButton';
import IconButton from '../common/IconButton';
import { formatNumber } from '../../utils/format';
import type { Tone } from '../../theme/tones';

type Props = {
  title: string;
  dueAtKm: number;
  currentKm: number;
  intervalKm: number;
  onBook?: () => void;
  onCalendar?: () => void;
};

/** بطاقة بيضاء: الصيانة القادمة + شريط التقدم + زر الحجز */
export default function NextMaintenanceCard({ title, dueAtKm, currentKm, intervalKm, onBook, onCalendar }: Props) {
  const remaining = Math.max(0, dueAtKm - currentKm);
  const used = 1 - remaining / intervalKm;
  const tone: Tone = remaining <= 500 ? 'critical' : 'warning';

  return (
    <View className="rounded-card bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-muted-ink">الصيانة القادمة</Text>
          <Text className="mt-0.5 text-base font-bold text-ink">
            {title} · بعد {formatNumber(remaining)} كم
          </Text>
        </View>
        <Text className="text-base font-bold text-accent-ink">{Math.round(used * 100)}٪</Text>
      </View>

      <View className="my-3">
        <ProgressBar value={used} tone={tone} onLight />
      </View>

      <View className="flex-row items-center">
        <IconButton icon="calendar-outline" onLight onPress={onCalendar} label="التقويم" />
        <PrimaryButton
          label="احجز موعد"
          variant="dark"
          icon={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
          onPress={onBook}
        />
      </View>
    </View>
  );
}
