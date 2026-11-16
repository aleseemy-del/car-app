import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, View, type DimensionValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { COLORS } from '../../theme/tones';

/** شاشة "جاري التحميل" كاملة */
export function LoadingView({ text = 'جاري التحميل…' }: { text?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text className="mt-3 text-base text-muted">{text}</Text>
    </View>
  );
}

/** خطأ مع زر إعادة المحاولة — full: شاشة كاملة، وإلا بطاقة صغيرة */
export function ErrorView({ message, onRetry, full }: { message: string; onRetry?: () => void; full?: boolean }) {
  return (
    <View className={full ? 'flex-1 items-center justify-center bg-canvas px-8' : 'items-center rounded-card bg-card p-5'}>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-status-critical/15">
        <Ionicons name="cloud-offline-outline" size={24} color="#FF453A" />
      </View>
      <Text className="mt-3 text-center text-base text-white">{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} className="mt-4 h-11 flex-row items-center rounded-full bg-accent px-5 active:opacity-80">
          <Ionicons name="refresh" size={18} color={COLORS.ink} />
          <Text className="ms-1.5 text-sm font-bold text-ink">حاول مرة ثانية</Text>
        </Pressable>
      )}
    </View>
  );
}

/** مربع رمادي ينبض مكان المحتوى وهو يحمّل */
export function Skeleton({ height = 16, width = '100%', radius = 12 }: { height?: number; width?: DimensionValue; radius?: number }) {
  const o = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [o]);
  return <Animated.View style={{ height, width, borderRadius: radius, backgroundColor: COLORS.line, opacity: o }} />;
}
