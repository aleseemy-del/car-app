import { View } from 'react-native';
import Text from '../common/Text';

type Props = { items: { label: string; value: string }[] };

export default function StatGrid({ items }: Props) {
  return (
    <View className="-m-1.5 flex-row flex-wrap">
      {items.map((s) => (
        <View key={s.label} className="w-1/2 p-1.5">
          <View className="rounded-tile bg-card p-4">
            <Text className="text-xs text-muted">{s.label}</Text>
            <Text className="mt-1 text-base font-bold text-white">{s.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
