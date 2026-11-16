import { View } from 'react-native';
import Text from '../common/Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/tones';

type Props = { tips: string[] };

export default function TipsCard({ tips }: Props) {
  return (
    <View className="rounded-card border border-accent/40 bg-accent/10 p-4">
      {tips.map((tip, i) => (
        <View key={i} className={`flex-row ${i > 0 ? 'mt-3' : ''}`}>
          <Ionicons name="bulb-outline" size={18} color={COLORS.accent} />
          <Text className="ms-2 flex-1 text-sm leading-5 text-white">{tip}</Text>
        </View>
      ))}
    </View>
  );
}
