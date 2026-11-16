export type SummerAdvice = { title: string; tips: string[] } | null;

/** نصائح حسب حرارة الكويت والغبار — ترجع null إذا الجو عادي */
export function getSummerAdvice(tempC: number, dust: boolean): SummerAdvice {
  const tips: string[] = [];

  if (tempC >= 45) {
    tips.push('الحرارة فوق 45° — البطارية تتعب أسرع، افحصها إذا عمرها فوق سنتين.');
    tips.push('وقّف بالظل أو استخدم مظلة الزجاج، والمقصورة تبرد أسرع.');
  }
  if (tempC >= 40) {
    tips.push('افحص ضغط الإطارات الصبح وهي باردة — الحرارة ترفع الضغط.');
    tips.push('تأكد من مستوى ماي الرديتر قبل المشاوير الطويلة.');
  }
  if (dust) {
    tips.push('فيه غبار — أجّل الغسيل، وشغّل المكيف على التدوير الداخلي.');
    tips.push('فلتر المكيف يتسكر أسرع مع الغبار، افحصه كل شهرين.');
  }

  if (tips.length === 0) return null;
  const title = tempC >= 40 ? `وضع الصيف · ${tempC}°` : dust ? 'تنبيه غبار' : 'نصائح اليوم';
  return { title, tips: tips.slice(0, 3) };
}
