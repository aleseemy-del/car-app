import { Pressable } from 'react-native';
import Text from './Text';

type Props = { label: string; selected?: boolean; onPress?: () => void };

export default function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`me-2 rounded-full px-4 py-2 ${selected ? 'bg-accent' : 'bg-card'}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-ink' : 'text-white'}`}>{label}</Text>
    </Pressable>
  );
}
