import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from '../components/navigation/TabBar';
import DashboardScreen from '../screens/DashboardScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import AccountScreen from '../screens/AccountScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#0B0B0C' } }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'الرئيسية' }} />
      <Tab.Screen name="Maintenance" component={MaintenanceScreen} options={{ title: 'الصيانة' }} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'المصاريف' }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'حسابي' }} />
    </Tab.Navigator>
  );
}
