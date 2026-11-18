import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import Text from '../components/common/Text';
import SafeAreaView from '../components/common/SafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip, PrimaryButton, ScreenHeader } from '../components/common';
import { SectionTitle } from '../components/dashboard';
import { Field } from '../components/forms';
import { useStore } from '../store/AppStore';
import type { FamilyRole } from '../store/types';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/tones';
import { alertT, tr } from '../i18n';
import { useFeedback } from '../feedback/FeedbackProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Family'>;
const ROLES: Record<FamilyRole, string> = { viewer: 'يشوف بس', manager: 'يشوف ويعدّل' };
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/**
 * مشاركة السيارة مع العائلة.
 * المالك يضيف الإيميل والصلاحية. لما الشخص يسجّل في التطبيق بنفس الإيميل، يشوف السيارة تلقائياً.
 * الصلاحيات ينفذها الخادم (RLS): "يشوف بس" ما يقدر يضيف أو يحذف حتى لو حاول.
 */
export default function FamilyScreen({ navigation }: Props) {
  const { state, activeCar, addMember, removeMember, cloud } = useStore();
  const { run } = useFeedback();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<FamilyRole>('viewer');
  const [error, setError] = useState<string>();

  const isOwner = !activeCar.role || activeCar.role === 'owner';
  const members = state.family.filter((m) => m.carId === activeCar.id);

  const invite = async () => {
    const mail = email.trim().toLowerCase();
    if (!name.trim() || !isEmail(mail)) return setError('اكتب الاسم وإيميل صحيح');
    if (mail === state.user?.email?.toLowerCase()) return setError('هذا إيميلك أنت');
    if (members.some((m) => m.email === mail)) return setError('هذا الشخص مضاف من قبل');
    const ok = await run(async () => {
      await addMember({ carId: activeCar.id, name: name.trim(), email: mail, role });
      return true;
    }, { loadingText: 'جاري الحفظ…' });
    if (!ok) return;
    const invitedName = name.trim();
    setName('');
    setEmail('');
    await Share.share({
      message: tr(`هلا ${invitedName}، أضفتك على سيارتي ${activeCar.name} في تطبيق حالة السيارة. حمّل التطبيق وسجّل بإيميلك ${mail} وبتشوف السيارة.`),
    }).catch(() => {});
  };

  const confirmRemove = (id: string, n: string) =>
    alertT(`إزالة ${n}؟`, 'ما بيقدر يشوف السيارة بعدها.', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'إزالة', style: 'destructive', onPress: () => removeMember(id) },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2" keyboardShouldPersistTaps="handled">
        <ScreenHeader title="مشاركة العائلة" subtitle={activeCar.name} onBack={() => navigation.goBack()} />

        {!cloud ? (
          <View className="mt-6 rounded-card bg-card p-4">
            <Text className="text-sm leading-6 text-white">المشاركة تحتاج حساب. سجّل دخول عشان أهلك يشوفون السيارة من جوالاتهم.</Text>
          </View>
        ) : !isOwner ? (
          <View className="mt-6 rounded-card bg-card p-4">
            <Text className="text-base font-bold text-accent">هذي السيارة مشاركة معك</Text>
            <Text className="mt-1 text-sm leading-6 text-white">
              {activeCar.role === 'manager' ? 'صلاحيتك: تشوف وتعدّل.' : 'صلاحيتك: تشوف بس.'} صاحب السيارة هو اللي يضيف ويشيل الأعضاء.
            </Text>
          </View>
        ) : (
          <>
            <Text className="mt-4 text-sm leading-6 text-muted">أضف إيميل الشخص. لما يسجّل في التطبيق بنفس الإيميل، يشوف هالسيارة من جواله.</Text>

            <View className="mt-4 overflow-hidden rounded-card bg-card">
              {members.length === 0 ? (
                <Text className="p-6 text-center text-sm text-muted">ما أضفت أحد للحين</Text>
              ) : (
                members.map((m, i) => (
                  <View key={m.id} className={`flex-row items-center px-4 py-3.5 ${i === members.length - 1 ? '' : 'border-b border-line'}`}>
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                      <Text className="text-base font-bold text-ink">{m.name.charAt(0)}</Text>
                    </View>
                    <View className="ms-3 flex-1">
                      <Text className="text-base font-semibold text-white">{m.name}</Text>
                      <Text className="mt-0.5 text-xs text-muted" style={{ writingDirection: 'ltr', textAlign: 'right' }}>
                        {m.email}
                      </Text>
                      <Text className="mt-0.5 text-xs text-accent">{ROLES[m.role]}</Text>
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
              <Field
                label="الإيميل"
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(undefined); }}
                error={error}
                style={{ textAlign: 'left' }}
              />
              <Text className="mb-2 text-sm text-muted">الصلاحية</Text>
              <View className="mb-5 flex-row">
                {(Object.keys(ROLES) as FamilyRole[]).map((r) => (
                  <Chip key={r} label={ROLES[r]} selected={role === r} onPress={() => setRole(r)} />
                ))}
              </View>
              <View className="flex-row">
                <PrimaryButton label="أضف وأرسل دعوة" icon="share-outline" onPress={invite} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
