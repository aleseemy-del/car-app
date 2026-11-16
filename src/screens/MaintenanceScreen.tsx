import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Chip, ScreenHeader } from '../components/common';
import { SectionTitle } from '../components/dashboard';
import { MaintenanceItem, NextMaintenanceCard } from '../components/maintenance';
import { SERVICES } from '../data/serviceMeta';
import { workshops } from '../data/workshops';
import { useStore } from '../store/AppStore';
import type { LoggableService } from '../store/types';
import { formatDate, formatKwd } from '../utils/format';
import { COLORS } from '../theme/tones';
import { alertT } from '../i18n';
import { useFeedback } from '../feedback/FeedbackProvider';

const LOGGABLE = SERVICES.filter((s) => s.record.kind === 'log');

export default function MaintenanceScreen() {
  const navigation = useNavigation();
  const { state, activeCar, cancelBooking, deleteLog, payBooking, refreshBookings, canEdit } = useStore();
  const { run } = useFeedback();

  // راجع من صفحة الدفع؟ نجيب حالة الحجوزات من الخادم
  // (ref عشان ما يعيد الطلب مع كل تحديث للشاشة)
  const refreshRef = useRef(refreshBookings);
  refreshRef.current = refreshBookings;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refreshRef.current().catch(() => {});
    });
    refreshRef.current().catch(() => {});
    return () => sub.remove();
  }, []);

  const pay = (id: string) =>
    run(async () => {
      await Linking.openURL(await payBooking(id));
    }, { loadingText: 'نجهز صفحة الدفع…' });
  const [filter, setFilter] = useState<'all' | LoggableService>('all');

  const bookings = state.bookings.filter((b) => b.carId === activeCar.id).sort((a, b) => a.date.localeCompare(b.date));
  const logs = state.logs
    .filter((l) => l.carId === activeCar.id && (filter === 'all' || l.service === filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = logs.reduce((sum, l) => sum + (l.costKwd ?? 0), 0);


  // الضغط على سجل: تعديل أو حذف
  const openLog = (id: string, service: string) =>
    alertT('السجل', undefined, [
      { text: 'تعديل', onPress: () => navigation.navigate('LogService', { service: service as never, editId: id }) },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () =>
          alertT('حذف السجل؟', undefined, [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'حذف', style: 'destructive', onPress: () => deleteLog(id) },
          ]),
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);

  const confirm = (title: string, onOk: () => void) =>
    alertT(title, undefined, [
      { text: 'لا', style: 'cancel' },
      { text: 'نعم', style: 'destructive', onPress: onOk },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="الصيانة" subtitle={activeCar.name} />

        <View className="mt-6">
          {activeCar.oilDueKm != null ? (
            <NextMaintenanceCard
              title="تغيير الزيت"
              dueAtKm={activeCar.oilDueKm}
              currentKm={activeCar.mileageKm}
              intervalKm={activeCar.oilIntervalKm}
              onBook={() => navigation.navigate('Workshops', { service: 'oil' })}
              onCalendar={() => navigation.navigate('Notifications')}
            />
          ) : (
            <Pressable onPress={() => navigation.navigate('LogService', { service: 'oil' })} className="rounded-card bg-surface p-4 active:opacity-85">
              <Text className="text-xs text-muted-ink">الصيانة القادمة</Text>
              <Text className="mt-1 text-base font-bold text-ink">سجّل آخر تغيير زيت عشان نحسب الموعد القادم</Text>
              <Text className="mt-2 text-sm font-bold text-accent-ink">+ سجّل الحين</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-7">
          <SectionTitle title="مواعيدك" actionLabel="+ احجز" onActionPress={() => navigation.navigate('Workshops', {})} />
          <View className="overflow-hidden rounded-card bg-card">
            {bookings.length === 0 ? (
              <Text className="p-6 text-center text-sm text-muted">ما عندك مواعيد</Text>
            ) : (
              bookings.map((b, i) => {
                const w = workshops.find((x) => x.id === b.workshopId);
                return (
                  <View key={b.id} className={`flex-row items-center px-4 py-3.5 ${i === bookings.length - 1 ? '' : 'border-b border-line'}`}>
                    <View className="h-11 w-11 items-center justify-center rounded-tile bg-accent">
                      <Ionicons name="calendar" size={20} color={COLORS.ink} />
                    </View>
                    <View className="ms-3 flex-1">
                      <Text className="text-base font-semibold text-white">{b.serviceLabel} · {w?.name}</Text>
                      <Text className="mt-0.5 text-xs text-muted">{formatDate(b.date)} · {b.time}</Text>
                      {b.paymentStatus === 'paid' && <Text className="mt-0.5 text-xs font-bold text-status-good">✓ مدفوع {b.amountKwd?.toFixed(3)} د.ك</Text>}
                      {b.paymentStatus === 'pending' && <Text className="mt-0.5 text-xs text-accent">بانتظار تأكيد الدفع</Text>}
                      {b.paymentStatus === 'failed' && <Text className="mt-0.5 text-xs text-status-critical">ما تم الدفع</Text>}
                    </View>
                    {canEdit && b.paymentStatus && b.paymentStatus !== 'paid' && (
                      <Pressable onPress={() => pay(b.id)} className="me-2 rounded-full bg-accent px-3 py-1.5 active:opacity-80">
                        <Text className="text-xs font-bold text-ink">ادفع</Text>
                      </Pressable>
                    )}
                    {b.paymentStatus !== 'paid' && (
                      <Pressable onPress={() => confirm('إلغاء الموعد؟', () => cancelBooking(b.id))} accessibilityLabel="إلغاء الموعد">
                        <Ionicons name="close-circle-outline" size={22} color={COLORS.muted} />
                      </Pressable>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View className="mt-7">
          <SectionTitle title="سجل الصيانة" />
          {/* أزرار التسجيل السريع */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 mb-4" contentContainerClassName="px-5">
            {LOGGABLE.map((s) => (
              <Pressable key={s.key} onPress={() => navigation.navigate('LogService', { service: s.key })} className="me-2 h-10 flex-row items-center rounded-full bg-surface px-3.5 active:opacity-80">
                <Ionicons name="add" size={16} color={COLORS.ink} />
                <Text className="ms-1 text-sm font-semibold text-ink">{s.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {state.logs.some((l) => l.carId === activeCar.id) && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 mb-3" contentContainerClassName="px-5">
              <Chip label="الكل" selected={filter === 'all'} onPress={() => setFilter('all')} />
              {LOGGABLE.map((s) => (
                <Chip key={s.key} label={s.title} selected={filter === s.key} onPress={() => setFilter(s.key as LoggableService)} />
              ))}
            </ScrollView>
          )}

          <View className="overflow-hidden rounded-card bg-card">
            {logs.length === 0 ? (
              <Text className="p-6 text-center text-sm leading-6 text-muted">ما سجّلت أي صيانة للحين.{'\n'}اختر من الأزرار فوق وسجّل.</Text>
            ) : (
              logs.map((l, i) => <MaintenanceItem key={l.id} log={l} last={i === logs.length - 1} onPress={() => openLog(l.id, l.service)} />)
            )}
          </View>

          {total > 0 && (
            <View className="mt-3 flex-row justify-between px-1">
              <Text className="text-sm text-muted">إجمالي التكلفة</Text>
              <Text className="text-sm font-bold text-white">{formatKwd(total)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
