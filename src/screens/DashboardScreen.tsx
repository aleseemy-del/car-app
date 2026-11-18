import { I18nManager, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../components/common/Text';
import SafeAreaView from '../components/common/SafeAreaView';
import { useNavigation } from '@react-navigation/native';
import { DashboardHeader, SectionTitle, ServiceGrid, SummerCard, VehicleCard } from '../components/dashboard';
import { NextMaintenanceCard } from '../components/maintenance';
import { CarSwitcher } from '../components/cars';
import { buildServiceItems, buildVehicleStats } from '../data/dashboard';
import { HOME_SERVICE_KEYS } from '../data/serviceMeta';
import { useStore } from '../store/AppStore';
import { useWeather } from '../services/weather';
import { computeReminders } from '../utils/reminders';
import { carHealth } from '../utils/serviceStatus';
import { getSummerAdvice } from '../utils/summer';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { state, activeCar, setActiveCar } = useStore();
  const { weather } = useWeather(); // حقيقي من الإنترنت — لو ما توفر ما نعرض شي
  const warn = state.settings.oilWarnKm;
  const ctx = { car: activeCar, logs: state.logs, expenses: state.expenses, weather, oilWarnKm: warn };
  const reminders = computeReminders(activeCar, warn);
  const advice = weather ? getSummerAdvice(weather.tempC, weather.dust) : null;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <DashboardHeader
          userName={state.user?.name ?? ''}
          location="الكويت"
          hasNotifications={reminders.length > 0}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />

        <View className="mt-4">
          <CarSwitcher cars={state.cars} activeId={activeCar.id} onSelect={setActiveCar} onAdd={() => navigation.navigate('AddCar')} />
        </View>

        <View className="mt-4">
          <VehicleCard
            car={activeCar}
            status={carHealth(ctx)}
            stats={buildVehicleStats(activeCar, state.settings.unit, warn)}
            onPress={() => navigation.navigate('Tabs', { screen: 'Maintenance' })}
            onStatPress={(s) => {
              if (s.target === 'mileage') navigation.navigate('LogService', { service: 'mileage' });
              else if (s.missing) navigation.navigate('LogService', { service: s.target });
              else navigation.navigate('ServiceDetail', { serviceId: s.target });
            }}
          />
        </View>

        {advice && (
          <View className="mt-4">
            <SummerCard advice={advice} onPress={() => navigation.navigate('ServiceDetail', { serviceId: 'weather' })} />
          </View>
        )}

        <Pressable
          onPress={() => navigation.navigate('Chat')}
          className="mt-4 flex-row items-center rounded-card bg-accent p-4 active:opacity-85"
          accessibilityRole="button"
          accessibilityLabel="اسأل مساعد السيارة"
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-ink">
            <Ionicons name="chatbubbles" size={20} color="#FF7A1A" />
          </View>
          <View className="ms-3 flex-1">
            <Text className="text-base font-bold text-ink">عندك مشكلة في سيارتك؟</Text>
            <Text className="mt-0.5 text-xs text-ink">اسأل المساعد يشخّصها ويعطيك الحل</Text>
          </View>
          <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#0B0B0C" />
        </Pressable>

        <View className="mt-6">
          <SectionTitle title="الخدمات" actionLabel="عرض الكل" onActionPress={() => navigation.navigate('Services')} />
          <ServiceGrid items={buildServiceItems(HOME_SERVICE_KEYS, ctx)} onSelect={(item) => navigation.navigate('ServiceDetail', { serviceId: item.id })} />
        </View>

        {/* بطاقة الزيت تطلع بس لو سجّل آخر تغيير */}
        {activeCar.oilDueKm != null && (
          <View className="mt-5">
            <NextMaintenanceCard
              title="تغيير الزيت"
              dueAtKm={activeCar.oilDueKm}
              currentKm={activeCar.mileageKm}
              intervalKm={activeCar.oilIntervalKm}
              onBook={() => navigation.navigate('Workshops', { service: 'oil' })}
              onCalendar={() => navigation.navigate('Notifications')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
