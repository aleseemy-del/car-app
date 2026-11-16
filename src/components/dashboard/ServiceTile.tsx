import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Tone } from '../../theme/tones';
import { COLORS } from '../../theme/tones';

export type MCIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export type ServiceTone = Tone;

export type ServiceItem = {
  id: string;
  title: string;
  value: string;
  icon: MCIconName;
  tone?: ServiceTone;
  group?: ServiceGroup;
};

export type ServiceGroup = 'maintenance' | 'daily' | 'papers' | 'emergency';

type Props = ServiceItem & { onPress?: () => void };

// الخدمة اللي تحتاج انتباه تاخذ برتقالي (أو أحمر)، والباقي أبيض
const BOX: Record<Tone, string> = {
  warning: 'bg-accent',
  critical: 'bg-status-critical',
  good: 'bg-surface',
  neutral: 'bg-surface',
};

export default function ServiceTile({ title, value, icon, tone = 'neutral', onPress }: Props) {
  const alert = tone === 'warning' || tone === 'critical';

  return (
    <Pressable onPress={onPress} className="items-center active:opacity-70" accessibilityRole="button" accessibilityLabel={`${title}، ${value}`}>
      <View className={`h-14 w-14 items-center justify-center rounded-tile ${BOX[tone]}`}>
        <MaterialCommunityIcons name={icon} size={24} color={COLORS.ink} />
      </View>
      <Text className={`mt-2 text-xs ${alert ? 'font-bold text-white' : 'text-muted'}`}>{title}</Text>
      {/* "سجّل" = المستخدم ما سجّل شي لهالخدمة */}
      <Text className={`mt-0.5 text-[10px] ${value === 'سجّل' ? 'text-accent' : alert ? 'text-accent' : 'text-muted'}`} numberOfLines={1}>
        {value === 'سجّل' ? '+ سجّل' : value}
      </Text>
    </Pressable>
  );
}
