import './global.css';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AppStoreProvider } from './src/store/AppStore';
import ReminderScheduler from './src/services/ReminderScheduler';
import { FeedbackProvider } from './src/feedback/FeedbackProvider';
import SyncErrorBridge from './src/feedback/SyncErrorBridge';

/** على الويب: عمود بعرض جوال في وسط الشاشة (التطبيق مصمم للجوال)، وعلى الجوال ما يتغير شي */
function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 480, backgroundColor: '#0B0B0C', overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#0B0B0C', card: '#0B0B0C' } };

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <FeedbackProvider>
          <ReminderScheduler />
          <SyncErrorBridge />
          <WebFrame>
            <NavigationContainer theme={theme}>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </WebFrame>
        </FeedbackProvider>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
