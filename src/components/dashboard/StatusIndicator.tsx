import { View } from 'react-native';
import Text from '../common/Text';

export type VehicleStatus = 'good' | 'warning' | 'critical' | 'unknown';

const STATUS: Record<VehicleStatus, { dot: string; halo: string; label: string }> = {
  good: { dot: 'bg-status-good', halo: 'bg-status-good/25', label: 'حالة ممتازة' },
  warning: { dot: 'bg-accent', halo: 'bg-accent/25', label: 'تحتاج متابعة' },
  critical: { dot: 'bg-status-critical', halo: 'bg-status-critical/25', label: 'تحتاج صيانة' },
  unknown: { dot: 'bg-muted', halo: 'bg-muted/25', label: 'أكمل بيانات سيارتك' },
};

type Props = {
  status: VehicleStatus;
  dotOnly?: boolean;
  /** نص إضافي بعد الحالة، مثل رقم اللوحة */
  suffix?: string;
};

export default function StatusIndicator({ status, dotOnly = false, suffix }: Props) {
  const s = STATUS[status];

  return (
    <View className="flex-row items-center" accessibilityLabel={s.label}>
      <View className={`h-4 w-4 items-center justify-center rounded-full ${s.halo}`}>
        <View className={`h-2 w-2 rounded-full ${s.dot}`} />
      </View>
      {!dotOnly && (
        <Text className="ms-1.5 text-xs text-muted">
          {s.label}
          {suffix ? ` · ${suffix}` : ''}
        </Text>
      )}
    </View>
  );
}
