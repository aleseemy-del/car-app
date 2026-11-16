import { View } from 'react-native';
import ServiceTile, { type ServiceItem } from './ServiceTile';

type Props = {
  items: ServiceItem[];
  onSelect?: (item: ServiceItem) => void;
};

/** شبكة 4 أعمدة — تلتف تلقائياً لصف جديد */
export default function ServiceGrid({ items, onSelect }: Props) {
  return (
    <View className="-mb-4 flex-row flex-wrap">
      {items.map((item) => (
        <View key={item.id} className="mb-4 w-1/4">
          <ServiceTile {...item} onPress={() => onSelect?.(item)} />
        </View>
      ))}
    </View>
  );
}
