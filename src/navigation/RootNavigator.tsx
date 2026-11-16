import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ServicesScreen from '../screens/ServicesScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AddCarScreen from '../screens/AddCarScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import WorkshopsScreen from '../screens/WorkshopsScreen';
import BookingScreen from '../screens/BookingScreen';
import FamilyScreen from '../screens/FamilyScreen';
import LogServiceScreen from '../screens/LogServiceScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import LanguageScreen from '../screens/onboarding/LanguageScreen';
import SignUpScreen from '../screens/onboarding/SignUpScreen';
import { useEffect } from 'react';
import { useStore } from '../store/AppStore';
import { ErrorView, LoadingView } from '../components/common';
import { applyDirection } from '../i18n/direction';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { ready, onboarded, loadError, retryLoad, state } = useStore();

  // لو اتجاه الشاشة ما يطابق اللغة المحفوظة (أول تشغيل بعد التغيير) نصلحه
  useEffect(() => {
    if (ready) applyDirection(state.settings.lang);
  }, [ready, state.settings.lang]);

  if (loadError) return <ErrorView full message="ما قدرنا نفتح بياناتك" onRetry={retryLoad} />;
  if (!ready) return <LoadingView />;

  // ما سجّل أو ما أضاف سيارة: شاشات التسجيل بس
  if (!onboarded) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0B0C' }, animation: 'slide_from_right' }}>
        {/* أول مرة: اللغة قبل كل شي */}
        {!state.settings.langChosen && <Stack.Screen name="Language" component={LanguageScreen} />}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="AddFirstCar" component={AddCarScreen} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0B0C' }, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Workshops" component={WorkshopsScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Family" component={FamilyScreen} />
      {/* النماذج تطلع من تحت */}
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="AddCar" component={AddCarScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="LogService" component={LogServiceScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
