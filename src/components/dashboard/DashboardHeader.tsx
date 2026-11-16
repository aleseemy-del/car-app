import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/tones';

type Props = {
  userName: string;
  location?: string;
  hasNotifications?: boolean;
  onNotificationsPress?: () => void;
};

export default function DashboardHeader({ userName, location, hasNotifications, onNotificationsPress }: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
          <Text className="text-lg font-bold text-ink">{userName.charAt(0)}</Text>
        </View>
        <View className="ms-2.5">
          <Text className="text-xs text-muted">هلا،</Text>
          <Text className="text-lg font-bold text-white">{userName}</Text>
        </View>
      </View>

      <View className="flex-row items-center">
        {location && (
          <View className="me-2 flex-row items-center">
            <Ionicons name="location-outline" size={14} color={COLORS.muted} />
            <Text className="ms-1 text-xs text-muted">{location}</Text>
          </View>
        )}
        <Pressable
          onPress={onNotificationsPress}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
          accessibilityLabel="الإشعارات"
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.ink} />
          {hasNotifications && <View className="absolute end-3 top-2.5 h-2 w-2 rounded-full bg-accent" />}
        </Pressable>
      </View>
    </View>
  );
}
