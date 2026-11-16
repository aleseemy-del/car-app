import { useState } from 'react';
import { TextInput, View } from 'react-native';
import Text from '../common/Text';
import Chip from '../common/Chip';
import { COLORS } from '../../theme/tones';
import { tr } from '../../i18n';

type Props = {
  label: string;
  options: number[];
  value: number;
  onChange: (km: number) => void;
  hint?: string;
};

const fmt = (n: number) => n.toLocaleString('en-US');

/** اختيار كيلومترات: أرقام جاهزة + "رقم ثاني" يكتبه المستخدم */
export default function KmChooser({ label, options, value, onChange, hint }: Props) {
  const isCustom = !options.includes(value);
  const [custom, setCustom] = useState(isCustom);
  const [text, setText] = useState(isCustom ? String(value) : '');

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm text-muted">{label}</Text>
      <View className="flex-row flex-wrap">
        {options.map((o) => (
          <View key={o} className="mb-2">
            <Chip label={`${fmt(o)} كم`} selected={!custom && value === o} onPress={() => { setCustom(false); onChange(o); }} />
          </View>
        ))}
        <View className="mb-2">
          <Chip label="رقم ثاني" selected={custom} onPress={() => setCustom(true)} />
        </View>
      </View>
      {custom && (
        <View className="mt-1 h-12 flex-row items-center rounded-tile bg-card px-4">
          <TextInput
            value={text}
            onChangeText={(t) => {
              const v = t.replace(/\D/g, '');
              setText(v);
              const n = parseInt(v, 10);
              if (n > 0) onChange(n);
            }}
            autoFocus
            keyboardType="number-pad"
            placeholder={tr('مثلاً 7000')}
            placeholderTextColor={COLORS.gray}
            className="flex-1 text-base text-white"
          />
          <Text className="ms-2 text-sm text-muted">كم</Text>
        </View>
      )}
      {hint && <Text className="mt-1 text-xs text-muted">{hint}</Text>}
    </View>
  );
}
