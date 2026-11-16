import { View } from 'react-native';
import Text from '../common/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Tone } from '../../theme/tones';
import { COLORS } from '../../theme/tones';
import type { MCIconName } from '../dashboard/ServiceTile';

type Props = { icon: MCIconName; tone: Tone; headline: string; summary: string };

export default function ServiceHero({ icon, tone, headline, summary }: Props) {
  const alert = tone === 'warning' || tone === 'critical';

  return (
    <View className="items-center rounded-hero bg-card px-5 py-7">
      <View className={`h-16 w-16 items-center justify-center rounded-3xl ${alert ? 'bg-accent' : 'bg-surface'}`}>
        <MaterialCommunityIcons name={icon} size={30} color={COLORS.ink} />
      </View>
      <Text className={`mt-4 text-4xl font-bold ${alert ? 'text-accent' : 'text-white'}`}>{headline}</Text>
      <Text className="mt-1 text-center text-sm text-muted">{summary}</Text>
    </View>
  );
}
