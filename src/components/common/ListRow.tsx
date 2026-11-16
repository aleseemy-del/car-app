import type { ComponentProps, ReactNode } from 'react';
import { I18nManager, Pressable, View } from 'react-native';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/tones';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  right?: ReactNode;
  danger?: boolean;
  last?: boolean;
  onPress?: () => void;
};

export default function ListRow({ icon, label, value, right, danger, last, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center px-4 py-3.5 active:bg-card-2 ${last ? '' : 'border-b border-line'}`}
    >
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${danger ? 'bg-status-critical/15' : 'bg-card-2'}`}>
        <Ionicons name={icon} size={18} color={danger ? '#FF453A' : COLORS.white} />
      </View>
      <Text className={`ms-3 flex-1 text-base ${danger ? 'font-semibold text-status-critical' : 'text-white'}`}>{label}</Text>
      {value && <Text className="me-1 text-sm text-muted">{value}</Text>}
      {right ??
        (onPress && !danger && (
          <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={COLORS.muted} />
        ))}
    </Pressable>
  );
}
