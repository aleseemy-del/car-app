import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import { useStore } from '../../store/AppStore';
import { applyDirection } from '../../i18n/direction';
import type { Lang } from '../../i18n';
import { COLORS } from '../../theme/tones';

/** أول شاشة: اختيار اللغة — تطلع مرة وحدة بس */
export default function LanguageScreen() {
  const { updateSettings } = useStore();

  const choose = (lang: Lang) => {
    updateSettings({ lang, langChosen: true });
    // لو الاتجاه يحتاج يتقلب (English) التطبيق يعيد التشغيل ثانية وحدة
    setTimeout(() => applyDirection(lang), 400);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas px-6" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-accent">
          <MaterialCommunityIcons name="car-side" size={42} color={COLORS.ink} />
        </View>
        {/* بالغتين عشان يفهمها الكل */}
        <Text className="mt-8 text-center text-2xl font-bold text-white">اختر اللغة</Text>
        <Text className="mt-1 text-center text-lg text-muted">Choose your language</Text>
      </View>

      <View className="pb-4" style={{ gap: 12 }}>
        {([
          ['ar', 'العربية', 'Arabic'],
          ['en', 'English', 'الإنجليزية'],
        ] as const).map(([lang, label, sub]) => (
          <Pressable
            key={lang}
            onPress={() => choose(lang)}
            className={`h-16 flex-row items-center justify-between rounded-card px-5 active:opacity-85 ${lang === 'ar' ? 'bg-accent' : 'bg-surface'}`}
          >
            <Text className="text-lg font-bold text-ink">{label}</Text>
            <Text className="text-sm text-ink/60">{sub}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
