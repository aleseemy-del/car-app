import { Linking } from 'react-native';

/** نفتح صفحة الدفع بس لو https ومن نطاق ماي فاتورة — الرابط يجي من الخادم، لكن ما نثق فيه أعمى */
export function isTrustedPaymentUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && (u.hostname === 'myfatoorah.com' || u.hostname.endsWith('.myfatoorah.com'));
  } catch {
    return false;
  }
}

export async function openPaymentUrl(url: string) {
  if (!isTrustedPaymentUrl(url)) throw new Error('رابط الدفع غير موثوق، حاول مرة ثانية');
  await Linking.openURL(url);
}
