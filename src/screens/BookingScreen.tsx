import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip, PrimaryButton, ScreenHeader } from '../components/common';
import { TIME_SLOTS, WORKSHOP_SERVICE_LABELS, workshops, type WorkshopService } from '../data/workshops';
import { useStore } from '../store/AppStore';
import { addDays, formatDate, toISODate } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';
import { alertT } from '../i18n';
import { useFeedback } from '../feedback/FeedbackProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;
const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function BookingScreen({ navigation, route }: Props) {
  const { activeCar, addBooking, payBooking, cloud } = useStore();
  const { run } = useFeedback();
  const w = workshops.find((x) => x.id === route.params.workshopId) ?? workshops[0];
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  const [service, setService] = useState<WorkshopService>(
    w.services.includes(route.params.service as WorkshopService) ? (route.params.service as WorkshopService) : w.services[0],
  );
  const [day, setDay] = useState(toISODate(days[0]));
  const [time, setTime] = useState<string>();

  const confirm = () => {
    if (!time) {
      alertT('اختر الوقت');
      return;
    }
    run(async () => {
      const id = await addBooking({ carId: activeCar.id, workshopId: w.id, serviceLabel: WORKSHOP_SERVICE_LABELS[service], date: day, time });
      const goToBookings = () => navigation.navigate('Tabs', { screen: 'Maintenance' });
      // الدفع: الخادم يحدد المبلغ ويسوي رابط ماي فاتورة، والحجز يصير "مدفوع" بس لما ماي فاتورة تأكد
      const pay = () =>
        run(async () => {
          const url = await payBooking(id);
          goToBookings();
          await Linking.openURL(url);
        }, { loadingText: 'نجهز صفحة الدفع…' });
      alertT('تم الحجز', `${WORKSHOP_SERVICE_LABELS[service]} في ${w.name}\n${formatDate(day)} الساعة ${time}`, cloud
        ? [
            { text: `ادفع العربون (${w.priceFromKwd} د.ك)`, onPress: pay },
            { text: 'لاحقاً', style: 'cancel', onPress: goToBookings },
          ]
        : [{ text: 'تمام', onPress: goToBookings }]);
    }, { loadingText: 'جاري الحجز…' });
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-6 pt-2">
        <ScreenHeader title={w.name} subtitle={`${w.area} · ${activeCar.name}`} onBack={() => navigation.goBack()} />

        <Text className="mb-2 mt-7 text-sm text-muted">الخدمة</Text>
        <View className="flex-row flex-wrap">
          {w.services.map((s) => (
            <View key={s} className="mb-2">
              <Chip label={WORKSHOP_SERVICE_LABELS[s]} selected={service === s} onPress={() => setService(s)} />
            </View>
          ))}
        </View>

        <Text className="mb-2 mt-5 text-sm text-muted">اليوم</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerClassName="px-5">
          {days.map((d) => {
            const iso = toISODate(d);
            const on = iso === day;
            return (
              <Pressable key={iso} onPress={() => setDay(iso)} className={`me-2 h-20 w-16 items-center justify-center rounded-tile ${on ? 'bg-accent' : 'bg-card'}`}>
                <Text className={`text-xs ${on ? 'text-ink' : 'text-muted'}`}>{DAY_NAMES[d.getDay()]}</Text>
                <Text className={`mt-1 text-xl font-bold ${on ? 'text-ink' : 'text-white'}`}>{d.getDate()}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-2 mt-5 text-sm text-muted">الوقت</Text>
        <View className="flex-row flex-wrap">
          {TIME_SLOTS.map((t) => (
            <View key={t} className="mb-2">
              <Chip label={t} selected={time === t} onPress={() => setTime(t)} />
            </View>
          ))}
        </View>

        <View className="mt-5 rounded-card bg-surface p-4">
          <Text className="text-xs text-muted-ink">ملخص الحجز</Text>
          <Text className="mt-1 text-base font-bold text-ink">
            {WORKSHOP_SERVICE_LABELS[service]} · {formatDate(day)}{time ? ` · ${time}` : ''}
          </Text>
          <Text className="mt-1 text-sm text-muted-ink">
            {cloud ? `العربون ${w.priceFromKwd} د.ك · ادفعه أونلاين بكي نت أو البطاقة` : `السعر يبدأ من ${w.priceFromKwd} د.ك · الدفع في الورشة`}
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row px-5 pb-2 pt-3">
        <PrimaryButton label="أكّد الحجز" onPress={confirm} />
      </View>
    </SafeAreaView>
  );
}
