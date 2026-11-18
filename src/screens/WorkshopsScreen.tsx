import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Text from '../components/common/Text';
import SafeAreaView from '../components/common/SafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip, ScreenHeader } from '../components/common';
import { WORKSHOP_SERVICE_LABELS, workshops, type WorkshopService } from '../data/workshops';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/tones';

type Props = NativeStackScreenProps<RootStackParamList, 'Workshops'>;
const FILTERS = Object.keys(WORKSHOP_SERVICE_LABELS) as WorkshopService[];

export default function WorkshopsScreen({ navigation, route }: Props) {
  const initial = FILTERS.includes(route.params?.service as WorkshopService) ? (route.params?.service as WorkshopService) : null;
  const [filter, setFilter] = useState<WorkshopService | null>(initial);
  const list = filter ? workshops.filter((w) => w.services.includes(filter)) : workshops;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="الورش والحجز" subtitle={`${list.length} مكان متاح`} onBack={() => navigation.goBack()} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 mb-4 mt-5" contentContainerClassName="px-5">
          <Chip label="الكل" selected={!filter} onPress={() => setFilter(null)} />
          {FILTERS.map((f) => (
            <Chip key={f} label={WORKSHOP_SERVICE_LABELS[f]} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        {list.map((w) => (
          <Pressable
            key={w.id}
            onPress={() => navigation.navigate('Booking', { workshopId: w.id, service: filter ?? w.services[0] })}
            className="mb-3 rounded-card bg-card p-4 active:opacity-85"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-white">{w.name}</Text>
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="location-outline" size={13} color={COLORS.muted} />
                  <Text className="ms-1 text-xs text-muted">{w.area} · {w.hours}</Text>
                </View>
              </View>
              <View className="flex-row items-center rounded-full bg-card-2 px-2.5 py-1">
                <Ionicons name="star" size={12} color={COLORS.accent} />
                <Text className="ms-1 text-xs font-bold text-white">{w.rating}</Text>
                <Text className="ms-1 text-xs text-muted">({w.reviews})</Text>
              </View>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <View className="flex-1 flex-row flex-wrap">
                {w.services.map((s) => (
                  <Text key={s} className="mb-1 me-1.5 rounded-full bg-card-2 px-2.5 py-1 text-xs text-muted">
                    {WORKSHOP_SERVICE_LABELS[s]}
                  </Text>
                ))}
              </View>
              <Text className="text-sm font-bold text-accent">من {w.priceFromKwd} د.ك</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
