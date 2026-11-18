import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import Text from '../components/common/Text';
import SafeAreaView from '../components/common/SafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip, PrimaryButton, ScreenHeader } from '../components/common';
import { DateField, Field } from '../components/forms';
import { EXPENSE_CATEGORIES, EXPENSE_ORDER } from '../data/expenses';
import { useStore } from '../store/AppStore';
import type { ExpenseCategory } from '../store/types';
import { pickImage } from '../services/imagePicker';
import { scanReceipt } from '../services/receiptScanner';
import { toISODate } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/tones';
import { useFeedback } from '../feedback/FeedbackProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;


export default function AddExpenseScreen({ navigation, route }: Props) {
  const { state, activeCar, addExpense, updateExpense } = useStore();
  const { run } = useFeedback();
  // تعديل مصروف موجود؟
  const editing = route.params?.editId ? state.expenses.find((e) => e.id === route.params?.editId) : undefined;
  const [category, setCategory] = useState<ExpenseCategory>(editing?.category ?? route.params?.category ?? 'fuel');
  const [amount, setAmount] = useState(editing ? String(editing.amountKwd) : '');
  const [date, setDate] = useState(editing?.date ?? toISODate(new Date()));
  // الممشى الحالي جاهز (أو اللي انسجّل مع المصروف)
  const [odometer, setOdometer] = useState(editing ? (editing.odometerKm ? String(editing.odometerKm) : '') : String(activeCar.mileageKm));
  const [note, setNote] = useState(editing?.note ?? '');
  const [receiptUri, setReceiptUri] = useState<string | undefined>(editing?.receiptUri);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string>();
  const [error, setError] = useState<string>();

  const takeReceipt = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (!uri) return;
    setReceiptUri(uri);
    setScanning(true);
    const result = await scanReceipt(uri);
    setScanning(false);
    if (result) {
      if (result.amountKwd) setAmount(String(result.amountKwd));
      if (result.category) setCategory(result.category);
      if (result.note) setNote(result.note);
      setScanMsg('قرينا الفاتورة — راجع المبلغ قبل الحفظ');
    } else {
      setScanMsg('انحفظت صورة الفاتورة — اكتب المبلغ');
    }
  };

  // لو انفتحت الشاشة من "صوّر فاتورة" نفتح الكاميرا مباشرة
  useEffect(() => {
    if (route.params?.scan) takeReceipt('camera');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) {
      setError('اكتب المبلغ');
      return;
    }
    const odo = parseInt(odometer.replace(/,/g, ''), 10);
    const fields = {
      category,
      amountKwd: Math.round(value * 1000) / 1000,
      date,
      odometerKm: Number.isFinite(odo) ? odo : undefined,
      note: note.trim() || undefined,
      receiptUri,
    };
    run(async () => {
      if (editing) await updateExpense({ ...editing, ...fields });
      else await addExpense({ carId: activeCar.id, ...fields });
      navigation.goBack();
    }, { loadingText: 'جاري الحفظ…' });
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-6 pt-2" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={editing ? 'تعديل المصروف' : 'مصروف جديد'} subtitle={activeCar.name} onBack={() => navigation.goBack()} />

        {/* الفاتورة */}
        <View className="mt-6 rounded-card bg-card p-4">
          {receiptUri ? (
            <View className="flex-row items-center">
              <Image source={{ uri: receiptUri }} className="h-16 w-16 rounded-tile" />
              <View className="ms-3 flex-1">
                {scanning ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color={COLORS.accent} />
                    <Text className="ms-2 text-sm text-white">نقرأ الفاتورة…</Text>
                  </View>
                ) : (
                  <Text className="text-sm text-white">{scanMsg}</Text>
                )}
              </View>
              <Pressable onPress={() => setReceiptUri(undefined)} accessibilityLabel="حذف الصورة">
                <Ionicons name="close-circle" size={22} color={COLORS.muted} />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row">
              <Pressable onPress={() => takeReceipt('camera')} className="me-2 h-12 flex-1 flex-row items-center justify-center rounded-full bg-surface active:opacity-80">
                <Ionicons name="camera-outline" size={18} color={COLORS.ink} />
                <Text className="ms-1.5 text-sm font-bold text-ink">صوّر الفاتورة</Text>
              </Pressable>
              <Pressable onPress={() => takeReceipt('library')} className="h-12 flex-1 flex-row items-center justify-center rounded-full border border-line active:opacity-80">
                <Ionicons name="images-outline" size={18} color={COLORS.white} />
                <Text className="ms-1.5 text-sm text-white">من الصور</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text className="mb-2 mt-6 text-sm text-muted">النوع</Text>
        <View className="mb-4 flex-row flex-wrap">
          {EXPENSE_ORDER.map((c) => (
            <View key={c} className="mb-2">
              <Chip label={EXPENSE_CATEGORIES[c].label} selected={category === c} onPress={() => setCategory(c)} />
            </View>
          ))}
        </View>

        <Field
          label="المبلغ"
          suffix="د.ك"
          keyboardType="decimal-pad"
          placeholder="0.000"
          value={amount}
          onChangeText={(t) => {
            setAmount(t);
            setError(undefined);
          }}
          error={error}
        />

        <DateField label="تاريخ المصروف" value={date} onChange={setDate} />

        <Field label="قراءة العداد (اختياري)" suffix="كم" keyboardType="number-pad" placeholder={String(activeCar.mileageKm)} value={odometer} onChangeText={setOdometer} />
        <Field label="ملاحظة (اختياري)" placeholder="مثلاً: بنزين ممتاز" value={note} onChangeText={setNote} />
      </ScrollView>

      <View className="flex-row px-5 pb-2 pt-3">
        <PrimaryButton label={editing ? 'احفظ التعديل' : 'احفظ المصروف'} onPress={save} />
      </View>
    </SafeAreaView>
  );
}
