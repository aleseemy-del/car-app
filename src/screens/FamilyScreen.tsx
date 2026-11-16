import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip, PrimaryButton, ScreenHeader } from '../components/common';
import { SectionTitle } from '../components/dashboard';
import { Field } from '../components/forms';
import { useStore } from '../store/AppStore';
import type { FamilyRole } from '../store/types';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/tones';
import { alertT } from '../i18n';
import { useFeedback } from '../feedback/FeedbackProvider';
import { tr } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Family'>;
const ROLES: Record<FamilyRole, string> = { viewer: 'يشوف بس', manager: 'يشوف ويعدّل' };

export default function FamilyScreen({ navigation }: Props) {
  const { state, activeCar, addMember, removeMember } = useStore();
  const { run } = useFeedback();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<FamilyRole>('viewer');
  const [error, setError] = useState<string>();

  const invite = async () => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 8) {
      setError('اكتب الاسم ورقم صحيح');
      return;
    }
    await run(async () => addMember({ name: name.trim(), phone: phone.trim(), role }), { loadingText: 'جاري الحفظ…' });
    setName('');
    setPhone('');
    // المشاركة الفعلية بين الأجهزة تحتاج حسابات وقاعدة بيانات — الحين نرسل دعوة نصية
    await Share.share({ message: tr(`هلا ${name.trim()}، أضفتك على سيارتي ${activeCar.name} في تطبيق حالة السيارة. حمّل التطبيق وسجّل برقمك ${phone.trim()}.`) }).catch(() => {});
  };

  const confirmRemove = (id: string, n: string) =>
    alertT(`إزالة ${n}؟`, undefined, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'إزالة', style: 'destructive', onPress: () => removeMember(id) },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2" keyboardShouldPersistTaps="handled">
        <ScreenHeader title="مشاركة العائلة" subtitle="خلّ أهلك يتابعون حالة السيارة" onBack={() => navigation.goBack()} />

        <View className="mt-6 overflow-hidden rounded-card bg-card">
          {state.family.length === 0 ? (
            <Text className="p-6 text-center text-sm text-muted">ما أضفت أحد للحين</Text>
          ) : (
            state.family.map((m, i) => (
              <View key={m.id} className={`flex-row items-center px-4 py-3.5 ${i === state.family.length - 1 ? '' : 'border-b border-line'}`}>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                  <Text className="text-base font-bold text-ink">{m.name.charAt(0)}</Text>
                </View>
                <View className="ms-3 flex-1">
                  <Text className="text-base font-semibold text-white">{m.name}</Text>
                  <Text className="mt-0.5 text-xs text-muted">{m.phone} · {ROLES[m.role]}</Text>
                </View>
                <Pressable onPress={() => confirmRemove(m.id, m.name)} accessibilityLabel="إزالة">
                  <Ionicons name="trash-outline" size={20} color={COLORS.muted} />
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View className="mt-7">
          <SectionTitle title="أضف شخص" />
          <Field label="الاسم" placeholder="أم عبدالله" value={name} onChangeText={(t) => { setName(t); setError(undefined); }} />
          <Field label="رقم الجوال" placeholder="9xxxxxxx" keyboardType="phone-pad" value={phone} onChangeText={(t) => { setPhone(t); setError(undefined); }} error={error} />
          <Text className="mb-2 text-sm text-muted">الصلاحية</Text>
          <View className="mb-5 flex-row">
            {(Object.keys(ROLES) as FamilyRole[]).map((r) => (
              <Chip key={r} label={ROLES[r]} selected={role === r} onPress={() => setRole(r)} />
            ))}
          </View>
          <View className="flex-row">
            <PrimaryButton label="أرسل دعوة" icon="share-outline" onPress={invite} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
