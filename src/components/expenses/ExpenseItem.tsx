import { Pressable, View } from 'react-native';
import Text from '../common/Text';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EXPENSE_CATEGORIES } from '../../data/expenses';
import type { Expense } from '../../store/types';
import { formatDate, formatKwd } from '../../utils/format';
import { COLORS } from '../../theme/tones';

type Props = { expense: Expense; last?: boolean; onPress?: () => void };

export default function ExpenseItem({ expense, last, onPress }: Props) {
  const cat = EXPENSE_CATEGORIES[expense.category];

  return (
    <Pressable onPress={onPress} className={`flex-row items-center px-4 py-3.5 active:bg-card-2 ${last ? '' : 'border-b border-line'}`}>
      <View className="h-11 w-11 items-center justify-center rounded-tile bg-surface">
        <MaterialCommunityIcons name={cat.icon} size={22} color={COLORS.ink} />
      </View>
      <View className="ms-3 flex-1">
        <Text className="text-base font-semibold text-white">{expense.note || cat.label}</Text>
        <View className="mt-0.5 flex-row items-center">
          <Text className="text-xs text-muted">{formatDate(expense.date)}</Text>
          {expense.receiptUri && <Ionicons name="receipt-outline" size={12} color={COLORS.accent} style={{ marginStart: 6 }} />}
        </View>
      </View>
      <Text className="text-sm font-bold text-white">{formatKwd(expense.amountKwd)}</Text>
    </Pressable>
  );
}
