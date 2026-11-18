import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Text from '../../components/common/Text';
import SafeAreaView from '../../components/common/SafeAreaView';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenHeader } from '../../components/common';
import { Field } from '../../components/forms';
import { useStore } from '../../store/AppStore';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { supabaseConfigured } from '../../services/supabase';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/**
 * إنشاء حساب / تسجيل دخول بالإيميل وكلمة السر (Supabase Auth).
 * كلمة السر يكتبها المستخدم بنفسه وتروح مباشرة للخادم — ما تنحفظ على الجهاز.
 */
export default function SignUpScreen({ navigation, route }: Props) {
  const [mode, setMode] = useState<'signup' | 'login'>(route.params?.mode ?? 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [confirmSentTo, setConfirmSentTo] = useState<string>();
  const { signUp, signIn, resetPassword } = useStore();
  const [resetSentTo, setResetSentTo] = useState<string>();
  const { run } = useFeedback();
  const signup = mode === 'signup';

  const submit = async () => {
    const e: typeof errors = {};
    if (signup && name.trim().length < 2) e.name = 'اكتب اسمك';
    if (!isEmail(email)) e.email = 'اكتب إيميل صحيح';
    if (password.length < (signup ? 8 : 1)) e.password = signup ? '8 أحرف على الأقل' : 'اكتب كلمة السر';
    setErrors(e);
    if (e.name || e.email || e.password) return;

    const res = await run(
      () => (signup ? signUp(email.trim().toLowerCase(), password, name.trim()) : signIn(email.trim().toLowerCase(), password)),
      { loadingText: signup ? 'جاري إنشاء الحساب…' : 'جاري الدخول…' },
    );
    if (!res) return; // الخطأ ينعرض فوق مع "حاول مرة ثانية"
    if (res.needsConfirm) {
      setConfirmSentTo(email.trim());
      setMode('login');
      setPassword('');
      return;
    }
    // عنده سيارات: التطبيق يفتح الرئيسية تلقائياً. ما عنده: يضيف أول سيارة
    if (!res.hasCars) navigation.navigate('AddFirstCar');
  };

  // نسيت كلمة السر: نرسل رابط على الإيميل، والرابط يفتح صفحة تغيير كلمة السر
  const forgot = async () => {
    if (!isEmail(email)) return setErrors({ email: 'اكتب إيميلك أول، بعدين اضغط نسيت كلمة السر' });
    const mail = email.trim().toLowerCase();
    const ok = await run(async () => {
      await resetPassword(mail);
      return true;
    }, { loadingText: 'جاري الإرسال…' });
    if (ok) setResetSentTo(mail);
  };

  const clear = (k: keyof typeof errors) => setErrors((x) => ({ ...x, [k]: undefined }));

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-5 pt-2" keyboardShouldPersistTaps="handled">
          <ScreenHeader
            title={signup ? 'إنشاء حساب' : 'تسجيل دخول'}
            subtitle={signup ? 'خطوة 1 من 2' : undefined}
            onBack={() => navigation.goBack()}
          />
          {signup && (
            <View className="mt-3 h-1 overflow-hidden rounded-full bg-card">
              <View className="h-full w-1/2 rounded-full bg-accent" />
            </View>
          )}

          {!supabaseConfigured && (
            <View className="mt-6 rounded-card border border-status-critical/50 bg-card p-3.5">
              <Text className="text-sm text-white">الخادم مو مربوط: أضف EXPO_PUBLIC_SUPABASE_URL و EXPO_PUBLIC_SUPABASE_KEY في ملف .env.local</Text>
            </View>
          )}

          {confirmSentTo && (
            <View className="mt-6 rounded-card bg-card p-3.5">
              <Text className="text-sm font-bold text-accent">تأكد من إيميلك</Text>
              <Text className="mt-1 text-sm leading-5 text-white">
                {`أرسلنا رابط تأكيد إلى ${confirmSentTo}. اضغط الرابط، بعدين ارجع هنا وسجّل دخول.`}
              </Text>
            </View>
          )}

          {resetSentTo && (
            <View className="mt-6 rounded-card bg-card p-3.5">
              <Text className="text-sm font-bold text-accent">شيّك إيميلك</Text>
              <Text className="mt-1 text-sm leading-5 text-white">
                {`لو الإيميل ${resetSentTo} مسجّل عندنا، بيوصلك رابط لتغيير كلمة السر. غيّرها وارجع سجّل دخول.`}
              </Text>
            </View>
          )}

          <View className="mt-8">
            {signup && (
              <Field label="الاسم" placeholder="عبدالرحمن" value={name} autoFocus onChangeText={(t) => { setName(t); clear('name'); }} error={errors.name} />
            )}
            <Field
              label="الإيميل"
              placeholder="name@example.com"
              value={email}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              onChangeText={(t) => { setEmail(t); clear('email'); }}
              error={errors.email}
              style={{ textAlign: 'left' }}
            />
            <Field
              label="كلمة السر"
              placeholder={signup ? '8 أحرف على الأقل' : '••••••••'}
              value={password}
              secureTextEntry
              autoCapitalize="none"
              textContentType={signup ? 'newPassword' : 'password'}
              autoComplete={signup ? 'new-password' : 'current-password'}
              onChangeText={(t) => { setPassword(t); clear('password'); }}
              error={errors.password}
              style={{ textAlign: 'left' }}
            />
            <Text className="mt-1 text-xs leading-5 text-muted">بياناتك محفوظة على الخادم، وما يشوفها أحد غيرك.</Text>
          </View>

          {!signup && (
            <Pressable onPress={forgot} className="mt-2 self-start py-2">
              <Text className="text-sm text-muted">نسيت كلمة السر؟</Text>
            </Pressable>
          )}

          <Pressable onPress={() => { setMode(signup ? 'login' : 'signup'); setErrors({}); }} className="mt-4 self-start py-2">
            <Text className="text-sm text-accent">{signup ? 'عندي حساب — سجّل دخول' : 'ما عندي حساب — أنشئ حساب'}</Text>
          </Pressable>
        </ScrollView>

        <View className="flex-row px-5 pb-2 pt-3">
          <PrimaryButton label={signup ? 'أنشئ الحساب' : 'دخول'} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
