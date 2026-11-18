import { DevSettings, I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { alertT } from './index';
import type { Lang } from './index';

/** العربي من اليمين لليسار، والإنجليزي العكس — تغيير الاتجاه يحتاج إعادة تشغيل */
export const needsDirectionChange = (lang: Lang) => I18nManager.isRTL !== (lang === 'ar');

export async function applyDirection(lang: Lang) {
  // الويب: الاتجاه يتغير من صفحة HTML مباشرة (بدون إعادة تشغيل)
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    return;
  }
  if (!needsDirectionChange(lang)) return;
  I18nManager.allowRTL(lang === 'ar');
  I18nManager.forceRTL(lang === 'ar');
  // داخل Expo Go إعادة التشغيل التلقائية تخرّب التطبيق — نكتفي بحفظ الاتجاه، ويتطبّق عند فتح التطبيق مرة ثانية
  if (Constants.executionEnvironment === 'storeClient') return;
  try {
    await Updates.reloadAsync();
  } catch {
    try {
      DevSettings.reload();
    } catch {
      alertT('سكّر التطبيق وافتحه مرة ثانية.');
    }
  }
}
