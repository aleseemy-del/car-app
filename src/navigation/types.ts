import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Maintenance: undefined;
  Expenses: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  // التسجيل
  Language: undefined;
  Welcome: undefined;
  SignUp: { mode?: 'signup' | 'login' } | undefined;
  AddFirstCar: undefined;
  // التطبيق
  Tabs: NavigatorScreenParams<TabParamList>;
  Services: undefined;
  ServiceDetail: { serviceId: string };
  Notifications: undefined;
  AddExpense: { scan?: boolean; category?: import('../store/types').ExpenseCategory; editId?: string } | undefined;
  LogService: { service: import('../data/serviceMeta').ServiceKey | 'mileage'; editId?: string };
  AddCar: undefined;
  Documents: undefined;
  Workshops: { service?: string };
  Booking: { workshopId: string; service?: string };
  Family: undefined;
};

// يخلي useNavigation() يعرف أسماء الشاشات في كل التطبيق
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
