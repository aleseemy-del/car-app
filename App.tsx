import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AppStoreProvider } from './src/store/AppStore';
import ReminderScheduler from './src/services/ReminderScheduler';
import { FeedbackProvider } from './src/feedback/FeedbackProvider';
import SyncErrorBridge from './src/feedback/SyncErrorBridge';

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#0B0B0C', card: '#0B0B0C' } };

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <FeedbackProvider>
          <ReminderScheduler />
          <SyncErrorBridge />
          <NavigationContainer theme={theme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </FeedbackProvider>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
