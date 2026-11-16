import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenHeader } from '../components/common';
import { Field, PickerSheet, SelectField, type PickerItem } from '../components/forms';
import { CAR_BRANDS, CAR_YEARS } from '../data/carCatalog';
import { useStore } from '../store/AppStore';
import type { RootStackParamList } from '../navigation/types';
import { useFeedback } from '../feedback/FeedbackProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCar' | 'AddFirstCar'>;
type Sheet = 'brand' | 'model' | 'year' | null;

// الماركات: الأكثر انتشاراً أول، بعدها الباقي أبجدياً
const BRAND_ITEMS: PickerItem[] = [
  ...CAR_BRANDS.filter((b) => b.popular).map((b) => ({ key: b.id, label: b.ar, sub: b.en, section: 'الأكثر انتشاراً' })),
  ...CAR_BRANDS.filter((b) => !b.popular)
    .sort((a, b) => a.ar.localeCompare(b.ar, 'ar'))
    .map((b) => ({ key: b.id, label: b.ar, sub: b.en, section: 'كل الماركات' })),
];
const YEAR_ITEMS: PickerItem[] = CAR_YEARS.map((y) => ({ key: y, label: y }));

export default function AddCarScreen({ navigation, route }: Props) {
  // في التسجيل: أول سيارة — بعد الحفظ التطبيق ينقل للرئيسية تلقائياً
  const first = route.name === 'AddFirstCar';
  const { addCar } = useStore();
  const { run } = useFeedback();

  const [brand, setBrand] = useState<PickerItem>();
  const [model, setModel] = useState<string>();
  const [year, setYear] = useState<string>();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [form, setForm] = useState({ plate: '', mileage: '', lastOil: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modelItems = useMemo<PickerItem[]>(() => {
    const b = CAR_BRANDS.find((x) => x.id === brand?.key);
    return (b?.models ?? []).map((m) => ({ key: m, label: m }));
  }, [brand]);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const save = () => {
    const e: Record<string, string> = {};
    if (!brand) e.brand = 'اختر الماركة';
    if (!model) e.model = 'اختر الموديل';
    const mileage = parseInt(form.mileage.replace(/,/g, ''), 10);
    if (!Number.isFinite(mileage)) e.mileage = 'اكتب الممشى';
    if (Object.keys(e).length) return setErrors(e);

    const lastOil = parseInt(form.lastOil.replace(/,/g, ''), 10);
    run(async () => {
      await addCar({
        name: model!,
        model: year ? `${brand!.label} · ${year}` : brand!.label,
        plate: form.plate.trim() || '—',
        mileageKm: mileage,
        oilIntervalKm: 5000,
        // موعد الزيت ما يتحدد إلا لو المستخدم كتب آخر تغيير
        oilDueKm: Number.isFinite(lastOil) ? lastOil + 5000 : undefined,
      });
      if (!first) navigation.goBack();
    }, { loadingText: 'جاري الحفظ…' });
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-6 pt-2" keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title={first ? 'أضف سيارتك' : 'سيارة جديدة'}
          subtitle={first ? 'خطوة 3 من 3' : undefined}
          onBack={first ? undefined : () => navigation.goBack()}
        />
        {first && (
          <View className="mt-3 h-1 overflow-hidden rounded-full bg-card">
            <View className="h-full w-full rounded-full bg-accent" />
          </View>
        )}

        <View className="mt-6">
          <SelectField label="الماركة" placeholder="اختر الماركة" value={brand?.label} sub={brand?.sub} error={errors.brand} onPress={() => setSheet('brand')} />
          <SelectField
            label="الموديل"
            placeholder={brand ? 'اختر الموديل' : 'اختر الماركة أول'}
            value={model}
            disabled={!brand}
            error={errors.model}
            onPress={() => setSheet('model')}
          />
          <SelectField label="سنة الصنع" placeholder="اختر السنة" value={year} onPress={() => setSheet('year')} />
          <Field label="رقم اللوحة" placeholder="12 / 34567" value={form.plate} onChangeText={set('plate')} />
          <Field label="الممشى الحالي" suffix="كم" keyboardType="number-pad" placeholder="25000" value={form.mileage} onChangeText={set('mileage')} error={errors.mileage} />
          <Field label="ممشى آخر تغيير زيت (اختياري)" suffix="كم" keyboardType="number-pad" placeholder="22000" value={form.lastOil} onChangeText={set('lastOil')} />
        </View>
      </ScrollView>

      <View className="flex-row px-5 pb-2 pt-3">
        <PrimaryButton label={first ? 'ابدأ' : 'أضف السيارة'} onPress={save} />
      </View>

      <PickerSheet
        visible={sheet === 'brand'}
        title="الماركة"
        items={BRAND_ITEMS}
        selectedKey={brand?.key}
        searchPlaceholder="ابحث: تويوتا أو Toyota"
        allowCustom
        onSelect={(b) => {
          if (b.key !== brand?.key) setModel(undefined);
          setBrand(b);
          setErrors((e) => ({ ...e, brand: '' }));
          // بعد الماركة نفتح الموديل مباشرة
          setTimeout(() => setSheet('model'), 350);
        }}
        onClose={() => setSheet((s) => (s === 'brand' ? null : s))}
      />
      <PickerSheet
        visible={sheet === 'model'}
        title={brand ? `موديلات ${brand.label}` : 'الموديل'}
        items={modelItems}
        selectedKey={model}
        searchPlaceholder="ابحث عن الموديل"
        allowCustom
        onSelect={(m) => {
          setModel(m.label);
          setErrors((e) => ({ ...e, model: '' }));
        }}
        onClose={() => setSheet((s) => (s === 'model' ? null : s))}
      />
      <PickerSheet visible={sheet === 'year'} title="سنة الصنع" items={YEAR_ITEMS} selectedKey={year} searchPlaceholder="مثلاً 2024" onSelect={(y) => setYear(y.label)} onClose={() => setSheet(null)} />
    </SafeAreaView>
  );
}
