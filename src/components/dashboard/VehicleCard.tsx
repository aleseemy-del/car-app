import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import StatusIndicator, { type VehicleStatus } from './StatusIndicator';
import VehicleStats from './VehicleStats';
import type { VehicleStat } from '../../data/dashboard';
import type { Car } from '../../store/types';
import { COLORS } from '../../theme/tones';

type Props = {
  car: Car;
  status: VehicleStatus;
  stats: VehicleStat[];
  onPress?: () => void;
  onStatPress?: (stat: VehicleStat) => void;
};

export default function VehicleCard({ car, status, stats, onPress, onStatPress }: Props) {
  const { name, model, plate } = car;

  return (
    <View className="rounded-hero bg-card px-4 pb-3.5 pt-5">
      {/* الاسم + الحالة + زر الدخول */}
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-xs text-accent">{model}</Text>
          <Text className="mt-0.5 text-2xl font-bold text-white">{name}</Text>
          <View className="mt-2">
            <StatusIndicator status={status} suffix={plate} />
          </View>
        </View>
        <Pressable
          onPress={onPress}
          className="h-12 w-12 items-center justify-center rounded-full bg-accent active:opacity-80"
          accessibilityLabel="تفاصيل السيارة"
        >
          <Ionicons name="arrow-up" size={20} color={COLORS.ink} style={{ transform: [{ rotate: '-45deg' }] }} />
        </Pressable>
      </View>

      {/* صورة السيارة */}
      <View className="my-2 h-36 items-center justify-center">
        {/* لصورة حقيقية: <Image source={require('../../../assets/car.png')} className="h-full w-full" resizeMode="contain" /> */}
        <MaterialCommunityIcons name="car-side" size={120} color={COLORS.white} />
      </View>

      <VehicleStats stats={stats} onStatPress={onStatPress} />
    </View>
  );
}
