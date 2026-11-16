import { Pressable, ScrollView, Switch, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LanguageToggle, ListRow, ScreenHeader } from '../components/common';
import { SectionTitle, StatusIndicator } from '../components/dashboard';
import { useStore } from '../store/AppStore';
import { distance } from '../utils/format';
import { carHealth } from '../utils/serviceStatus';
import { COLORS } from '../theme/tones';
import { alertT } from '../i18n';

export default function AccountScreen() {
  const navigation = useNavigation();
  const { state, activeCar, setActiveCar, updateSettings, signOut } = useStore();
  const { settings } = state;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="حسابي" />

        <View className="mt-6 flex-row items-center rounded-card bg-surface p-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Text className="text-xl font-bold text-ink">{state.user?.name.charAt(0)}</Text>
          </View>
          <View className="ms-3 flex-1">
            <Text className="text-lg font-bold text-ink">{state.user?.name}</Text>
            <Text className="mt-0.5 text-sm text-muted-ink" style={{ writingDirection: 'ltr' }}>
              {state.user?.email || state.user?.phone || 'حساب تجريبي'}
            </Text>
          </View>
        </View>

        {/* سياراتي — الضغط يخليها السيارة النشطة */}
        <View className="mt-7">
          <SectionTitle title="سياراتي" actionLabel="+ إضافة سيارة" onActionPress={() => navigation.navigate('AddCar')} />
          <View className="overflow-hidden rounded-card bg-card">
            {state.cars.map((car, i) => {
              const on = car.id === activeCar.id;
              return (
                <Pressable
                  key={car.id}
                  onPress={() => setActiveCar(car.id)}
                  className={`flex-row items-center px-4 py-3.5 active:bg-card-2 ${i === state.cars.length - 1 ? '' : 'border-b border-line'}`}
                >
                  <View className={`h-11 w-11 items-center justify-center rounded-tile ${on ? 'bg-accent' : 'bg-surface'}`}>
                    <Ionicons name="car-sport" size={22} color={COLORS.ink} />
                  </View>
                  <View className="ms-3 flex-1">
                    <Text className="text-base font-bold text-white">{car.name}</Text>
                    <Text className="mt-0.5 text-xs text-muted">
                      {car.model} · {distance(car.mileageKm, settings.unit)}
                    </Text>
                  </View>
                  {on ? <Text className="text-xs font-bold text-accent">النشطة</Text> : <StatusIndicator status={carHealth({ car, logs: state.logs, expenses: state.expenses, oilWarnKm: state.settings.oilWarnKm })} dotOnly />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-7">
          <SectionTitle title="سيارتي" />
          <View className="overflow-hidden rounded-card bg-card">
            <ListRow icon="document-text-outline" label="أوراق السيارة" onPress={() => navigation.navigate('Documents')} />
            <ListRow icon="construct-outline" label="الورش والحجز" onPress={() => navigation.navigate('Workshops', {})} />
            <ListRow icon="people-outline" label="مشاركة العائلة" value={state.family.length ? String(state.family.length) : undefined} onPress={() => navigation.navigate('Family')} last />
          </View>
        </View>

        <View className="mt-7">
          <SectionTitle title="الإعدادات" />
          <View className="overflow-hidden rounded-card bg-card">
            <ListRow
              icon="notifications-outline"
              label="تنبيهات الصيانة"
              right={
                <Switch
                  value={settings.notifications}
                  onValueChange={(v) => updateSettings({ notifications: v })}
                  trackColor={{ true: COLORS.accent, false: COLORS.line }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <ListRow icon="language-outline" label="اللغة" right={<LanguageToggle />} />
            <ListRow
              icon="speedometer-outline"
              label="وحدة المسافة"
              value={settings.unit === 'km' ? 'كم' : 'ميل'}
              onPress={() => updateSettings({ unit: settings.unit === 'km' ? 'mi' : 'km' })}
            />
            <ListRow
              icon="alarm-outline"
              label="تذكير الزيت"
              value={`قبل ${settings.oilWarnKm.toLocaleString('en-US')} كم`}
              onPress={() => navigation.navigate('Notifications')}
            />
            <ListRow icon="list-outline" label="التنبيهات المستحقة" onPress={() => navigation.navigate('Notifications')} last />
          </View>
        </View>

        <View className="mt-4 overflow-hidden rounded-card bg-card">
          <ListRow
            icon="log-out-outline"
            label="تسجيل الخروج"
            danger
            last
            onPress={() =>
              alertT('تسجيل الخروج؟', 'بياناتك تبقى محفوظة على الجوال.', [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'خروج', style: 'destructive', onPress: signOut },
              ])
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
