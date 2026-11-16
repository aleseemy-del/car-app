import { Pressable, View } from 'react-native';
import Text from '../common/Text';

type Props = { title: string; actionLabel?: string; onActionPress?: () => void };

export default function SectionTitle({ title, actionLabel, onActionPress }: Props) {
  return (
    <View className="mb-3 flex-row items-center justify-between px-0.5">
      <Text className="text-lg font-bold text-white">{title}</Text>
      {actionLabel && (
        <Pressable onPress={onActionPress}>
          <Text className="text-xs font-semibold text-accent">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
