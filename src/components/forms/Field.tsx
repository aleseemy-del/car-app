import { TextInput, View, type TextInputProps } from 'react-native';
import Text from '../common/Text';
import { COLORS } from '../../theme/tones';
import { tr } from '../../i18n';

type Props = TextInputProps & { label: string; error?: string; suffix?: string };

/** حقل إدخال داكن بعنوان فوقه ورسالة خطأ تحته */
export default function Field({ label, error, suffix, ...input }: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm text-muted">{label}</Text>
      <View className={`h-12 flex-row items-center rounded-tile bg-card px-4 ${error ? 'border border-status-critical' : ''}`}>
        <TextInput
          placeholderTextColor={COLORS.gray}
          className="flex-1 text-base text-white"
          {...input}
          placeholder={tr(input.placeholder)}
        />
        {suffix && <Text className="ms-2 text-sm text-muted">{suffix}</Text>}
      </View>
      {error && <Text className="mt-1 text-xs text-status-critical">{error}</Text>}
    </View>
  );
}
