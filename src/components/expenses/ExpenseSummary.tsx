import { View } from 'react-native';
import Text from '../common/Text';
import { EXPENSE_CATEGORIES, EXPENSE_ORDER } from '../../data/expenses';
import type { Expense } from '../../store/types';
import { formatKwd, monthName } from '../../utils/format';

type Props = { expenses: Expense[]; today?: Date };

const ym = (iso: string) => iso.slice(0, 7);

/** بطاقة بيضاء: مصروف الشهر، مقارنة بالشهر الماضي، تكلفة الكيلو، وتوزيع حسب النوع */
export default function ExpenseSummary({ expenses, today = new Date() }: Props) {
  const thisKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

  const thisMonth = expenses.filter((e) => ym(e.date) === thisKey);
  const total = thisMonth.reduce((s, e) => s + e.amountKwd, 0);
  const prevTotal = expenses.filter((e) => ym(e.date) === prevKey).reduce((s, e) => s + e.amountKwd, 0);
  const diff = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  // تكلفة الكيلو: كل المصاريف ÷ المسافة بين أقل وأعلى قراءة عداد مسجلة
  const odos = expenses.map((e) => e.odometerKm).filter((n): n is number => typeof n === 'number');
  const km = odos.length >= 2 ? Math.max(...odos) - Math.min(...odos) : 0;
  const allTotal = expenses.reduce((s, e) => s + e.amountKwd, 0);
  const perKm = km > 0 ? (allTotal / km) * 1000 : null; // فلس لكل كم

  const byCat = EXPENSE_ORDER.map((c) => ({ c, sum: thisMonth.filter((e) => e.category === c).reduce((s, e) => s + e.amountKwd, 0) })).filter((x) => x.sum > 0);
  const max = Math.max(1, ...byCat.map((x) => x.sum));

  return (
    <View className="rounded-card bg-surface p-4">
      <Text className="text-xs text-muted-ink">مصروف {monthName(today.getMonth())}</Text>
      <View className="mt-1 flex-row items-end justify-between">
        <Text className="text-3xl font-bold text-ink">{formatKwd(total)}</Text>
        {diff !== null && (
          <Text className={`text-sm font-semibold ${diff > 0 ? 'text-accent-ink' : 'text-ink'}`}>
            {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}٪ عن الشهر الماضي
          </Text>
        )}
      </View>

      <View className="mt-4 flex-row border-t border-line-light pt-3">
        <View className="flex-1">
          <Text className="text-xs text-muted-ink">تكلفة الكيلو</Text>
          <Text className="mt-0.5 text-base font-bold text-ink">{perKm ? `${Math.round(perKm)} فلس` : '—'}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-muted-ink">عدد المصاريف</Text>
          <Text className="mt-0.5 text-base font-bold text-ink">{thisMonth.length}</Text>
        </View>
      </View>

      {byCat.length > 0 && (
        <View className="mt-4">
          {byCat.map(({ c, sum }) => (
            <View key={c} className="mb-2 flex-row items-center">
              <Text className="w-16 text-xs text-muted-ink">{EXPENSE_CATEGORIES[c].label}</Text>
              <View className="mx-2 h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <View className="h-full rounded-full bg-accent" style={{ width: `${(sum / max) * 100}%` }} />
              </View>
              <Text className="w-14 text-left text-xs font-semibold text-ink">{formatKwd(sum)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
