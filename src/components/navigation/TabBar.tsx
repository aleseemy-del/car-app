import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '../../theme/tones';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, [IconName, IconName]> = {
  Home: ['home-outline', 'home'],
  Maintenance: ['construct-outline', 'construct'],
  Expenses: ['wallet-outline', 'wallet'],
  Account: ['person-outline', 'person'],
};

/** شريط تنقل عائم على شكل كبسولة بيضاء — التبويب النشط برتقالي مع اسمه */
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute inset-x-7" style={{ bottom: Math.max(insets.bottom, 16) }} pointerEvents="box-none">
      <View className="flex-row items-center justify-between rounded-full bg-surface p-1.5">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key].options.title ?? route.name;
          const [idle, active] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              className={`h-12 flex-row items-center justify-center rounded-full ${focused ? 'bg-accent px-4' : 'w-12'}`}
            >
              <Ionicons name={focused ? active : idle} size={20} color={focused ? COLORS.ink : COLORS.gray} />
              {focused && <Text className="ms-1.5 text-sm font-bold text-ink">{label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
