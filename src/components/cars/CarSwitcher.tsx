import { Pressable, ScrollView } from 'react-native';
import Text from '../common/Text';
import { Ionicons } from '@expo/vector-icons';
import type { Car } from '../../store/types';
import { COLORS } from '../../theme/tones';

type Props = { cars: Car[]; activeId: string; onSelect: (id: string) => void; onAdd: () => void };

/** تبديل بين السيارات — يظهر بس لو عندك أكثر من سيارة أو تبي تضيف */
export default function CarSwitcher({ cars, activeId, onSelect, onAdd }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerClassName="px-5">
      {cars.map((c) => {
        const on = c.id === activeId;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            className={`me-2 h-10 flex-row items-center rounded-full px-4 ${on ? 'bg-surface' : 'bg-card'}`}
          >
            <Ionicons name="car-sport" size={16} color={on ? COLORS.ink : COLORS.muted} />
            <Text className={`ms-1.5 text-sm ${on ? 'font-bold text-ink' : 'text-muted'}`}>{c.name}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onAdd} className="h-10 w-10 items-center justify-center rounded-full border border-line" accessibilityLabel="أضف سيارة">
        <Ionicons name="add" size={20} color={COLORS.white} />
      </Pressable>
    </ScrollView>
  );
}
