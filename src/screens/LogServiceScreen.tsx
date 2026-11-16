import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip, PrimaryButton, ScreenHeader } from '../components/common';
import { DateField, Field, KmChooser, PickerSheet, SelectField, type PickerItem } from '../components/forms';
import { PART_BRANDS, PART_LABELS, PART_SPECS, type PartKind } from '../data/partsCatalog';
import { serviceMeta } from '../data/serviceMeta';
import { useStore } from '../store/AppStore';
import type { LoggableService } from '../store/types';
import { toISODate } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';
import { useFeedback } from '../feedback/FeedbackProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'LogService'>;

// عنوان التاريخ حسب الخدمة
const DATE_LABEL: Record<string, string> = {
  oil: 'تاريخ تغيير الزيت',
  battery: 'تاريخ تغيير البطارية',
  tires: 'تاريخ التغيير أو الترصيص',
  brakes: 'تاريخ صيانة الفرامل',
  ac: 'تاريخ صيانة المكيف',
  inspection: 'تاريخ الفحص',
  insurance: 'تاريخ التجديد',
};
const EXPIRY_LABEL: Record<string, string> = { insurance: 'تاريخ انتهاء التأمين', inspection: 'موعد الفحص القادم' };
const NUM = (s: string) => parseFloat(s.replace(/,/g, '').replace('٫', '.'));

/** تسجيل خدمة — أو تحديث الممشى (service = 'mileage') */
export default function LogServiceScreen({ navigation, route }: Props) {
  const { service } = route.params;
  const { activeCar, addLog, updateMileage } = useStore();
  const { run } = useFeedback();
  const isMileage = service === 'mileage';
  const meta = isMileage ? null : serviceMeta(service);
  const needsExpiry = service === 'insurance' || service === 'inspection';

  const today = toISODate(new Date());
  const [date, setDate] = useState(today);
  // الممشى الحالي جاهز في كل الخانات
  const [mileage, setMileage] = useState(String(activeCar.mileageKm));
  const [cost, setCost] = useState('');
  const [workshop, setWorkshop] = useState('');
  const [note, setNote] = useState('');
  const [expiry, setExpiry] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return toISODate(d);
  });
  const [interval, setIntervalKm] = useState(activeCar.oilIntervalKm || 5000);
  // الماركة والموديل والمقاس — للإطارات والبطارية والزيت
  const part: PartKind | null = service === 'tires' || service === 'battery' || service === 'oil' ? service : null;
  const [brand, setBrand] = useState<PickerItem>();
  const [product, setProduct] = useState<string>();
  const [spec, setSpec] = useState('');
  const [sheet, setSheet] = useState<'brand' | 'product' | null>(null);
  const brandItems: PickerItem[] = part ? PART_BRANDS[part].map((b) => ({ key: b.id, label: b.ar, sub: b.en })) : [];
  const productItems: PickerItem[] = part && brand ? (PART_BRANDS[part].find((b) => b.id === brand.key)?.models ?? []).map((m) => ({ key: m, label: m })) : [];
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const e: Record<string, string> = {};
    const km = NUM(mileage);
    if (isMileage) {
      if (!Number.isFinite(km) || km <= 0) e.mileage = 'اكتب الممشى';
      else if (km < activeCar.mileageKm) e.mileage = 'أقل من الممشى المسجّل';
      if (Object.keys(e).length) return setErrors(e);
      updateMileage(activeCar.id, Math.round(km));
      return navigation.goBack();
    }

    if (date > today) e.date = 'التاريخ ما يكون بالمستقبل';
    if (service === 'oil' && !Number.isFinite(km)) e.mileage = 'نحتاج الممشى عشان نحسب الموعد القادم';
    if (needsExpiry && expiry <= date) e.expiry = 'لازم يكون بعد تاريخ التجديد';
    if (Object.keys(e).length) return setErrors(e);

    const c = NUM(cost);
    run(async () => {
      await addLog({
        carId: activeCar.id,
        service: service as LoggableService,
        date,
        mileageKm: Number.isFinite(km) ? Math.round(km) : undefined,
        costKwd: Number.isFinite(c) && c > 0 ? c : undefined,
        workshop: workshop.trim() || undefined,
        note: note.trim() || undefined,
        expiry: needsExpiry ? expiry : undefined,
        intervalKm: service === 'oil' ? interval : undefined,
        brand: brand?.label,
        product,
        spec: spec.trim() || undefined,
      });
      navigation.goBack();
    }, { loadingText: 'جاري الحفظ…' });
  };

  const clear = (k: string) => setErrors((x) => ({ ...x, [k]: '' }));

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-6 pt-2" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={isMileage ? 'حدّث الممشى' : meta?.recordLabel ?? 'سجّل'} subtitle={activeCar.name} onBack={() => navigation.goBack()} />

        <View className="mt-6">
          {isMileage ? (
            <Field label={`الممشى الحالي (آخر تسجيل ${activeCar.mileageKm})`} suffix="كم" keyboardType="number-pad" placeholder={String(activeCar.mileageKm)} value={mileage} onChangeText={(t) => { setMileage(t); clear('mileage'); }} error={errors.mileage} autoFocus />
          ) : (
            <>
              <DateField label={DATE_LABEL[service] ?? 'التاريخ'} value={date} onChange={(v) => { setDate(v); clear('date'); }} error={errors.date} />

              {needsExpiry && (
                <DateField label={EXPIRY_LABEL[service]} value={expiry} onChange={(v) => { setExpiry(v); clear('expiry'); }} error={errors.expiry} />
              )}

              {service !== 'insurance' && (
                <Field label={service === 'oil' ? 'الممشى وقت التغيير' : 'الممشى (اختياري)'} suffix="كم" keyboardType="number-pad" value={mileage} onChangeText={(t) => { setMileage(t); clear('mileage'); }} error={errors.mileage} />
              )}

              {service === 'oil' && (
                <KmChooser
                  label="كل كم تغيّر الزيت؟"
                  options={[3000, 5000, 7500, 10000]}
                  value={interval}
                  onChange={setIntervalKm}
                  hint={Number.isFinite(NUM(mileage)) ? `التغيير القادم عند ${(Math.round(NUM(mileage)) + interval).toLocaleString('en-US')} كم` : undefined}
                />
              )}

              {part && (
                <>
                  <SelectField label={PART_LABELS[part].brand} placeholder="اختر الماركة" value={brand?.label} sub={brand?.sub} onPress={() => setSheet('brand')} />
                  <SelectField
                    label={`${PART_LABELS[part].model} (اختياري)`}
                    placeholder={brand ? 'اختر' : 'اختر الماركة أول'}
                    value={product}
                    disabled={!brand}
                    onPress={() => setSheet('product')}
                  />
                  {PART_SPECS[part] ? (
                    <>
                      <Text className="mb-2 text-sm text-muted">{PART_LABELS[part].spec} (اختياري)</Text>
                      <View className="mb-2 flex-row flex-wrap">
                        {PART_SPECS[part]!.map((v) => (
                          <View key={v} className="mb-2">
                            <Chip label={v} selected={spec === v} onPress={() => setSpec(spec === v ? '' : v)} />
                          </View>
                        ))}
                      </View>
                    </>
                  ) : (
                    <Field label={`${PART_LABELS[part].spec} (اختياري)`} placeholder="265/65 R17" value={spec} onChangeText={setSpec} autoCapitalize="characters" />
                  )}
                  <PickerSheet
                    visible={sheet === 'brand'}
                    title={PART_LABELS[part].brand}
                    items={brandItems}
                    selectedKey={brand?.key}
                    searchPlaceholder="ابحث بالعربي أو الإنجليزي"
                    allowCustom
                    onSelect={(b) => {
                      if (b.key !== brand?.key) setProduct(undefined);
                      setBrand(b);
                      const hasModels = PART_BRANDS[part].find((x) => x.id === b.key)?.models.length;
                      if (hasModels) setTimeout(() => setSheet('product'), 350);
                    }}
                    onClose={() => setSheet((x) => (x === 'brand' ? null : x))}
                  />
                  <PickerSheet
                    visible={sheet === 'product'}
                    title={brand ? `${PART_LABELS[part].model} · ${brand.label}` : PART_LABELS[part].model}
                    items={productItems}
                    selectedKey={product}
                    allowCustom
                    onSelect={(p) => setProduct(p.label)}
                    onClose={() => setSheet(null)}
                  />
                </>
              )}

              <Field label="التكلفة (اختياري)" suffix="د.ك" keyboardType="decimal-pad" placeholder="0" value={cost} onChangeText={setCost} />
              <Field label={service === 'insurance' ? 'شركة التأمين (اختياري)' : 'الورشة (اختياري)'} value={workshop} onChangeText={setWorkshop} />
              <Field label="ملاحظة (اختياري)" value={note} onChangeText={setNote} />
              <Text className="text-xs text-muted">لو كتبت التكلفة، تنضاف للمصاريف تلقائياً.</Text>
            </>
          )}
        </View>
      </ScrollView>
      <View className="flex-row px-5 pb-2 pt-3">
        <PrimaryButton label="احفظ" onPress={save} />
      </View>
    </SafeAreaView>
  );
}
