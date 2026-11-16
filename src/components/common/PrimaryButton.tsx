import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/tones';

type Props = {
  label: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** dark = زر أسود (على البطاقات البيضاء) */
  variant?: 'accent' | 'dark';
  onPress?: () => void;
};

export default function PrimaryButton({ label, icon, variant = 'accent', onPress }: Props) {
  const dark = variant === 'dark';

  return (
    <Pressable
      onPress={onPress}
      className={`h-12 flex-1 flex-row items-center justify-center rounded-full active:opacity-85 ${dark ? 'bg-ink' : 'bg-accent'}`}
    >
      <Text className={`text-base font-bold ${dark ? 'text-white' : 'text-ink'}`}>{label}</Text>
      {icon && (
        <Ionicons name={icon} size={18} color={dark ? COLORS.accent : COLORS.ink} style={{ marginStart: 6 }} />
      )}
    </Pressable>
  );
}
