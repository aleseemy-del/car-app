import { I18nManager, Pressable, View } from 'react-native';
import Text from '../common/Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/tones';
import { tr } from '../../i18n';

type Props = {
  label: string;
  value?: string;
  sub?: string;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  onPress: () => void;
};

/** حقل اختيار — يشبه Field بس يفتح قائمة */
export default function SelectField({ label, value, sub, placeholder, disabled, error, onPress }: Props) {
  return (
    <View className={`mb-4 ${disabled ? 'opacity-40' : ''}`}>
      <Text className="mb-1.5 text-sm text-muted">{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`h-12 flex-row items-center rounded-tile bg-card px-4 active:opacity-80 ${error ? 'border border-status-critical' : ''}`}
      >
        <Text className={`flex-1 text-base ${value ? 'text-white' : 'text-muted'}`}>
          {value ?? placeholder}
          {sub && tr(value ?? '') !== sub ? <Text className="text-sm text-muted">  {sub}</Text> : null}
        </Text>
        <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={COLORS.muted} />
      </Pressable>
      {error && <Text className="mt-1 text-xs text-status-critical">{error}</Text>}
    </View>
  );
}
