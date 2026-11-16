import * as ImagePicker from 'expo-image-picker';
import { alertT } from '../i18n';

/** يفتح الكاميرا أو الصور ويرجع رابط الصورة، أو null إذا ألغى المستخدم */
export async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!perm.granted) {
    alertT('نحتاج إذن', source === 'camera' ? 'اسمح للتطبيق باستخدام الكاميرا من الإعدادات.' : 'اسمح للتطبيق بالوصول للصور من الإعدادات.');
    return null;
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);

  return result.canceled ? null : result.assets[0]?.uri ?? null;
}

/** يسأل المستخدم: كاميرا أو صور */
export function askImageSource(onPicked: (uri: string) => void) {
  alertT('أضف صورة', undefined, [
    { text: 'الكاميرا', onPress: () => pickImage('camera').then((u) => u && onPicked(u)) },
    { text: 'من الصور', onPress: () => pickImage('library').then((u) => u && onPicked(u)) },
    { text: 'إلغاء', style: 'cancel' },
  ]);
}
