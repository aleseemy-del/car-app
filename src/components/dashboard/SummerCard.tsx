import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { Ionicons } from '@expo/vector-icons';
import type { SummerAdvice } from '../../utils/summer';
import { COLORS } from '../../theme/tones';

type Props = { advice: NonNullable<SummerAdvice>; onPress?: () => void };

/** بطاقة نصائح الصيف والغبار — تظهر بس لما الجو يستاهل */
export default function SummerCard({ advice, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="rounded-card border border-accent/40 bg-accent/10 p-4 active:opacity-85">
      <View className="mb-2 flex-row items-center">
        <Ionicons name="sunny" size={18} color={COLORS.accent} />
        <Text className="ms-2 text-base font-bold text-white">{advice.title}</Text>
      </View>
      {advice.tips.map((t, i) => (
        <View key={i} className="mt-1.5 flex-row">
          <Text className="me-2 text-accent">•</Text>
          <Text className="flex-1 text-sm leading-5 text-white">{t}</Text>
        </View>
      ))}
    </Pressable>
  );
}
