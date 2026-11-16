import { Pressable, ScrollView, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components/common';
import { SectionTitle } from '../components/dashboard';
import { ExpenseItem, ExpenseSummary } from '../components/expenses';
import { useStore } from '../store/AppStore';
import { COLORS } from '../theme/tones';
import { alertT } from '../i18n';

export default function ExpensesScreen() {
  const navigation = useNavigation();
  const { state, activeCar, deleteExpense } = useStore();
  const expenses = state.expenses
    .filter((e) => e.carId === activeCar.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const confirmDelete = (id: string) =>
    alertT('حذف المصروف؟', undefined, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="المصاريف"
          subtitle={`${activeCar.model.split(' · ')[0]} · ${activeCar.name}`}
          right={
            <Pressable
              onPress={() => navigation.navigate('AddExpense')}
              className="h-12 w-12 items-center justify-center rounded-full bg-accent active:opacity-80"
              accessibilityLabel="أضف مصروف"
            >
              <Ionicons name="add" size={26} color={COLORS.ink} />
            </Pressable>
          }
        />

        <View className="mt-6">
          <ExpenseSummary expenses={expenses} />
        </View>

        <View className="mt-7">
          <SectionTitle title="كل المصاريف" actionLabel="+ صوّر فاتورة" onActionPress={() => navigation.navigate('AddExpense', { scan: true })} />
          <View className="overflow-hidden rounded-card bg-card">
            {expenses.length === 0 ? (
              <Text className="p-6 text-center text-sm text-muted">سجّل أول مصروف من زر +</Text>
            ) : (
              expenses.map((e, i) => (
                <ExpenseItem key={e.id} expense={e} last={i === expenses.length - 1} onPress={() => confirmDelete(e.id)} />
              ))
            )}
          </View>
          {expenses.length > 0 && <Text className="mt-2 text-center text-xs text-muted">اضغط على أي مصروف لحذفه</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
