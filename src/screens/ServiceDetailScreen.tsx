import { Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import Text from '../components/common/Text';
import SafeAreaView from '../components/common/SafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ErrorView, PrimaryButton, ScreenHeader, Skeleton } from '../components/common';
import { SectionTitle } from '../components/dashboard';
import { MaintenanceItem } from '../components/maintenance';
import { ExpenseItem } from '../components/expenses';
import { ProgressCard, ServiceHero, StatGrid, TipsCard } from '../components/service';
import { serviceMeta } from '../data/serviceMeta';
import { useStore } from '../store/AppStore';
import { useWeather } from '../services/weather';
import { serviceView } from '../utils/serviceStatus';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/tones';
import { alertT } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceDetail'>;

export default function ServiceDetailScreen({ route, navigation }: Props) {
  const { state, activeCar, deleteLog } = useStore();
  const { weather, loading: weatherLoading, error: weatherError, reload: reloadWeather } = useWeather();
  const meta = serviceMeta(route.params.serviceId);

  if (!meta) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <Text className="text-muted">الخدمة غير موجودة</Text>
      </SafeAreaView>
    );
  }

  const view = serviceView(meta.key, { car: activeCar, logs: state.logs, expenses: state.expenses, weather, oilWarnKm: state.settings.oilWarnKm });
  const logs = state.logs.filter((l) => l.carId === activeCar.id && l.service === meta.key).sort((a, b) => b.date.localeCompare(a.date));
  const exps = meta.record.kind === 'expense'
    ? state.expenses.filter((e) => e.carId === activeCar.id && e.category === (meta.record as { category: string }).category).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
    : [];

  const record = () => {
    if (meta.record.kind === 'log') navigation.navigate('LogService', { service: meta.key });
    else if (meta.record.kind === 'expense') navigation.navigate('AddExpense', { category: meta.record.category });
  };

  const act = () => {
    const a = meta.action!;
    if (a.kind === 'book') return navigation.navigate('Workshops', { service: a.query });
    const q = encodeURIComponent(a.query);
    Linking.openURL(Platform.OS === 'ios' ? `maps://?q=${q}` : `geo:0,0?q=${q}`).catch(() => Linking.openURL(`https://www.google.com/maps/search/${q}`));
  };


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

  const confirmDelete = (id: string) =>
    alertT('حذف السجل؟', undefined, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteLog(id) },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-6 pt-2" showsVerticalScrollIndicator={false}>
        <ScreenHeader title={meta.title} subtitle={activeCar.name} onBack={() => navigation.goBack()} />

        <View className="mt-6">
          {meta.key === 'weather' && weatherLoading ? (
            // جاري تحميل الطقس
            <View className="items-center rounded-hero bg-card px-5 py-7" style={{ gap: 12 }}>
              <Skeleton height={64} width={64} radius={24} />
              <Skeleton height={36} width={120} />
              <Skeleton height={14} width={180} />
            </View>
          ) : meta.key === 'weather' && weatherError ? (
            <ErrorView message={weatherError} onRetry={reloadWeather} />
          ) : (
            <ServiceHero icon={meta.icon} tone={view.tone} headline={view.headline} summary={view.summary} />
          )}
        </View>

        {/* ما سجّل شي: زر واضح بدل أرقام */}
        {!view.recorded && meta.record.kind !== 'none' && (
          <Pressable onPress={record} className="mt-3 h-14 flex-row items-center justify-center rounded-card bg-surface active:opacity-85">
            <Ionicons name="add-circle" size={22} color={COLORS.ink} />
            <Text className="ms-2 text-base font-bold text-ink">{meta.recordLabel}</Text>
          </Pressable>
        )}

        {view.progress && (
          <View className="mt-3">
            <ProgressCard {...view.progress} tone={view.tone === 'neutral' ? 'warning' : view.tone} />
          </View>
        )}

        {view.stats.length > 0 && (
          <View className="mt-7">
            <SectionTitle title="التفاصيل" />
            <StatGrid items={view.stats} />
          </View>
        )}

        {meta.tips && (
          <View className="mt-7">
            <SectionTitle title="نصائح" />
            <TipsCard tips={meta.tips} />
          </View>
        )}

        {(logs.length > 0 || exps.length > 0) && (
          <View className="mt-7">
            <SectionTitle title="سجلّك" actionLabel={meta.recordLabel ? '+ سجّل' : undefined} onActionPress={record} />
            <View className="overflow-hidden rounded-card bg-card">
              {logs.map((l, i) => <MaintenanceItem key={l.id} log={l} last={i === logs.length - 1} onPress={() => openLog(l.id, l.service)} />)}
              {exps.map((e, i) => <ExpenseItem key={e.id} expense={e} last={i === exps.length - 1} />)}
            </View>
          </View>
        )}
      </ScrollView>

      {meta.action && (
        <View className="flex-row px-5 pb-2 pt-3">
          <PrimaryButton label={meta.action.label} icon={meta.action.icon} onPress={act} />
        </View>
      )}
    </SafeAreaView>
  );
}
