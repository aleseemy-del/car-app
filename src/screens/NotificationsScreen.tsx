import { Pressable, ScrollView, Switch, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenHeader } from '../components/common';
import { KmChooser } from '../components/forms';
import { useStore } from '../store/AppStore';
import { computeReminders } from '../utils/reminders';
import { sendTestNotification } from '../services/notifications';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/tones';
import { alertT } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
  const { state, updateSettings } = useStore();

  // تذكيرات كل السيارات
  const items = state.cars.flatMap((car) => computeReminders(car, state.settings.oilWarnKm).map((r) => ({ ...r, car })));

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2">
        <ScreenHeader title="التنبيهات" subtitle={items.length ? `${items.length} تنبيه` : 'كل شي تمام'} onBack={() => navigation.goBack()} />

        <View className="mt-6 flex-row items-center rounded-card bg-card p-4">
          <Text className="flex-1 text-base text-white">إشعارات الجوال</Text>
          <Switch
            value={state.settings.notifications}
            onValueChange={(v) => updateSettings({ notifications: v })}
            trackColor={{ true: COLORS.accent, false: COLORS.line }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View className="mt-5">
          <KmChooser
            label="ذكّرني قبل موعد الزيت بـ"
            options={[500, 1000, 1500, 2000, 3000]}
            value={state.settings.oilWarnKm}
            onChange={(km) => updateSettings({ oilWarnKm: km })}
            hint="والتأمين والفحص نذكّرك فيهم قبل الانتهاء بشهر."
          />
        </View>

        <Pressable
          onPress={async () => {
            const first = items[0];
            const ok = await sendTestNotification(first?.title ?? 'تنبيه تجريبي', first ? `${first.car.name} · ${first.body}` : 'الإشعارات شغالة على جوالك');
            alertT(ok ? 'اقفل الشاشة أو اطلع من التطبيق' : 'الإشعارات مقفلة', ok ? 'التنبيه بيوصلك بعد 5 ثواني.' : 'فعّل إشعارات التطبيق من إعدادات الجوال.');
          }}
          className="mt-4 h-12 flex-row items-center justify-center rounded-full border border-line active:opacity-70"
        >
          <Ionicons name="notifications-outline" size={18} color={COLORS.accent} />
          <Text className="ms-2 text-sm font-bold text-accent">جرّب تنبيه على جوالك</Text>
        </Pressable>

        <View className="mt-6 overflow-hidden rounded-card bg-card">
          {items.length === 0 ? (
            <Text className="p-6 text-center text-sm text-muted">ما فيه شي مستحق الحين</Text>
          ) : (
            items.map((r, i) => (
              <Pressable
                key={r.id}
                onPress={() => navigation.navigate('ServiceDetail', { serviceId: r.serviceId })}
                className={`flex-row items-center px-4 py-3.5 active:bg-card-2 ${i === items.length - 1 ? '' : 'border-b border-line'}`}
              >
                <View className={`h-10 w-10 items-center justify-center rounded-tile ${r.urgent ? 'bg-accent' : 'bg-surface'}`}>
                  <Ionicons name={r.urgent ? 'alert' : 'time-outline'} size={20} color={COLORS.ink} />
                </View>
                <View className="ms-3 flex-1">
                  <Text className="text-base font-semibold text-white">{r.title}</Text>
                  <Text className="mt-0.5 text-xs text-muted">
                    {r.car.name} · {r.body}
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={18} color={COLORS.muted} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
