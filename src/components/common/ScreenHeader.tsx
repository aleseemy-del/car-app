import type { ReactNode } from 'react';
import { I18nManager, Pressable, View } from 'react-native';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/tones';

type Props = { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode };

export default function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center">
        {onBack && (
          <Pressable
            onPress={onBack}
            className="me-3 h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
            accessibilityLabel="رجوع"
          >
            <Ionicons name={I18nManager.isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={COLORS.ink} />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white">{title}</Text>
          {subtitle && <Text className="mt-0.5 text-sm text-muted">{subtitle}</Text>}
        </View>
      </View>
      {right}
    </View>
  );
}
