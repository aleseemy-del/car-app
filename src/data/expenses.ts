import type { MCIconName } from '../components/dashboard/ServiceTile';
import type { ExpenseCategory } from '../store/types';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: MCIconName }> = {
  fuel: { label: 'بنزين', icon: 'gas-station' },
  maintenance: { label: 'صيانة', icon: 'wrench-outline' },
  wash: { label: 'غسيل', icon: 'car-wash' },
  insurance: { label: 'تأمين', icon: 'shield-car' },
  parts: { label: 'قطع غيار', icon: 'cog-outline' },
  other: { label: 'أخرى', icon: 'dots-horizontal' },
};

export const EXPENSE_ORDER: ExpenseCategory[] = ['fuel', 'maintenance', 'wash', 'insurance', 'parts', 'other'];
