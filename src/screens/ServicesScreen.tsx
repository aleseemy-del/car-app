import { ScrollView, View } from 'react-native';
import SafeAreaView from '../components/common/SafeAreaView';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenHeader } from '../components/common';
import { SectionTitle, ServiceGrid } from '../components/dashboard';
import { SERVICE_GROUPS, buildServiceItems } from '../data/dashboard';
import { useStore } from '../store/AppStore';
import { useWeather } from '../services/weather';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Services'>;

/** كل الخدمات مقسّمة حسب النوع */
export default function ServicesScreen({ navigation }: Props) {
  const { state, activeCar } = useStore();
  const { weather } = useWeather();
  const services = buildServiceItems('all', { car: activeCar, logs: state.logs, expenses: state.expenses, weather, oilWarnKm: state.settings.oilWarnKm });
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="كل الخدمات" subtitle={`${services.length} خدمة لسيارتك`} onBack={() => navigation.goBack()} />

        {SERVICE_GROUPS.map((g) => {
          const items = services.filter((s) => s.group === g.id);
          if (items.length === 0) return null;
          return (
            <View key={g.id} className="mt-7 rounded-card bg-card px-2 pb-5 pt-4">
              <View className="px-2">
                <SectionTitle title={g.title} />
              </View>
              <ServiceGrid
                items={items}
                onSelect={(item) => navigation.navigate('ServiceDetail', { serviceId: item.id })}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
