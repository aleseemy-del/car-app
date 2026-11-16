import { DevSettings, I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import { alertT } from './index';
import type { Lang } from './index';

/** العربي من اليمين لليسار، والإنجليزي العكس — تغيير الاتجاه يحتاج إعادة تشغيل */
export const needsDirectionChange = (lang: Lang) => I18nManager.isRTL !== (lang === 'ar');

export async function applyDirection(lang: Lang) {
  if (!needsDirectionChange(lang)) return;
  I18nManager.allowRTL(lang === 'ar');
  I18nManager.forceRTL(lang === 'ar');
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
