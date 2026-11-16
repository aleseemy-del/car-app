import { Pressable, View } from 'react-native';
import Text from './Text';
import { useStore } from '../../store/AppStore';
import { applyDirection } from '../../i18n/direction';
import type { Lang } from '../../i18n';

/** زر اللغة: العربية | English */
export default function LanguageToggle() {
  const { state, updateSettings } = useStore();
  const lang = state.settings.lang;
  const pick = (l: Lang) => {
    if (l === lang) return;
    updateSettings({ lang: l });
    // ننتظر الحفظ شوي قبل إعادة التشغيل
    setTimeout(() => applyDirection(l), 400);
  };
  return (
    <View className="flex-row self-start rounded-full bg-card p-1">
      {(['ar', 'en'] as const).map((l) => (
        <Pressable key={l} onPress={() => pick(l)} className={`rounded-full px-3.5 py-1.5 ${lang === l ? 'bg-surface' : ''}`}>
          <Text className={`text-xs font-bold ${lang === l ? 'text-ink' : 'text-muted'}`}>{l === 'ar' ? 'العربية' : 'English'}</Text>
        </Pressable>
      ))}
    </View>
  );
}
