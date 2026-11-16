import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { serviceMeta } from '../../data/serviceMeta';
import type { ServiceLog } from '../../store/types';
import { formatDate, formatKwd, formatNumber } from '../../utils/format';
import { COLORS } from '../../theme/tones';

type Props = { log: ServiceLog; last?: boolean; onPress?: () => void };

/** صف في سجل الصيانة — من اللي سجّله المستخدم */
export default function MaintenanceItem({ log, last, onPress }: Props) {
  const meta = serviceMeta(log.service);
  const meta2 = [formatDate(log.date), log.mileageKm ? `${formatNumber(log.mileageKm)} كم` : null, log.workshop].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} className={`flex-row items-center px-4 py-3.5 active:bg-card-2 ${last ? '' : 'border-b border-line'}`}>
      <View className="h-11 w-11 items-center justify-center rounded-tile bg-surface">
        <MaterialCommunityIcons name={meta?.icon ?? 'wrench-outline'} size={22} color={COLORS.ink} />
      </View>
      <View className="ms-3 flex-1">
        <Text className="text-base font-semibold text-white">{meta?.title ?? log.service}{log.brand ? ` · ${log.brand}` : log.note ? ` · ${log.note}` : ''}</Text>
        <Text className="mt-0.5 text-xs text-muted">{meta2}</Text>
      </View>
      {log.costKwd ? <Text className="text-sm font-bold text-white">{formatKwd(log.costKwd)}</Text> : null}
    </Pressable>
  );
}
