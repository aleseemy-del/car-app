import { Pressable, View } from 'react-native';
import Text from '../../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { I18nManager } from 'react-native';
import { LanguageToggle, PrimaryButton } from '../../components/common';
import { useStore } from '../../store/AppStore';
import type { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../theme/tones';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const POINTS: [string, string][] = [
  ['oil', 'تذكير بالزيت والتأمين والفحص قبل موعدهم'],
  ['wallet-outline', 'كل مصاريف سيارتك في مكان واحد'],
  ['calendar-check-outline', 'احجز من الورش بضغطة'],
];

export default function WelcomeScreen({ navigation }: Props) {
  const { loadDemo } = useStore();

  return (
    <SafeAreaView className="flex-1 bg-canvas px-6" edges={['top', 'bottom']}>
      <View className="pt-2">
        <LanguageToggle />
      </View>
      <View className="flex-1 justify-center">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-accent">
          <MaterialCommunityIcons name="car-side" size={34} color={COLORS.ink} />
        </View>
        <Text className="mt-6 text-4xl font-bold leading-[48px] text-white">
          صيانتك{'\n'}
          <Text className="text-accent">بموعدها</Text>
        </Text>
        <Text className="mt-3 text-base leading-6 text-muted">حالة السيارة، صيانتها، ومصاريفها — كلها في تطبيق واحد.</Text>

        <View className="mt-8">
          {POINTS.map(([icon, text]) => (
            <View key={text} className="mb-3 flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-tile bg-surface">
                <MaterialCommunityIcons name={icon as 'oil'} size={20} color={COLORS.ink} />
              </View>
              <Text className="ms-3 flex-1 text-sm text-white">{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="pb-2">
        <View className="flex-row">
          <PrimaryButton label="سجّل الحين" icon={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'} onPress={() => navigation.navigate('SignUp', { mode: 'signup' })} />
        </View>
        <Pressable onPress={() => navigation.navigate('SignUp', { mode: 'login' })} className="mt-3 h-12 items-center justify-center rounded-full border border-line active:opacity-70">
          <Text className="text-base text-white">عندي حساب</Text>
        </Pressable>
        <Pressable onPress={loadDemo} className="mt-3 flex-row items-center justify-center py-2">
          <Text className="text-sm text-muted">جرّب بدون تسجيل</Text>
          <Ionicons name="chevron-back" size={14} color={COLORS.muted} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
