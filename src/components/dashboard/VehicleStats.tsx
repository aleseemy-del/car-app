import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { VehicleStat } from '../../data/dashboard';
import { COLORS } from '../../theme/tones';

type Props = { stats: VehicleStat[]; onStatPress?: (stat: VehicleStat) => void };

/** القراءات الثلاث أسفل بطاقة السيارة مع فواصل رفيعة */
export default function VehicleStats({ stats, onStatPress }: Props) {
  return (
    <View className="flex-row border-t border-line pt-3">
      {stats.map((s, i) => (
        <Pressable
          key={s.label}
          onPress={() => onStatPress?.(s)}
          className="flex-1 items-center active:opacity-70"
          style={i > 0 ? { borderStartWidth: 1, borderColor: COLORS.line } : undefined}
        >
          <View className={`mb-1.5 h-10 w-10 items-center justify-center rounded-full border ${s.highlight ? 'border-accent' : 'border-line'}`}>
            <MaterialCommunityIcons name={s.icon} size={18} color={s.highlight ? COLORS.accent : s.missing ? COLORS.muted : COLORS.white} />
          </View>
          <Text className="text-xs text-muted">{s.label}</Text>
          {s.missing ? (
            <Text className="mt-0.5 text-sm font-bold text-accent">+ سجّل</Text>
          ) : (
            <Text className={`mt-0.5 text-base font-bold ${s.highlight ? 'text-accent' : 'text-white'}`}>
              {s.value} <Text className="text-xs font-normal text-muted">{s.unit}</Text>
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}
