import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/tones';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  onLight?: boolean;
  onPress?: () => void;
  label?: string;
};

/** زر دائري بحد رفيع — مثل زر التقويم بجانب "احجز موعد" */
export default function IconButton({ icon, onLight = false, onPress, label }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      className={`me-2 h-12 w-12 items-center justify-center rounded-full border active:opacity-70 ${
        onLight ? 'border-line-light' : 'border-line'
      }`}
    >
      <Ionicons name={icon} size={18} color={onLight ? COLORS.ink : COLORS.white} />
    </Pressable>
  );
}
