import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text as RNText, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Text from '../components/common/Text';
import { ScreenHeader } from '../components/common';
import { useStore } from '../store/AppStore';
import { remote } from '../services/remote';
import { COLORS } from '../theme/tones';
import { tr } from '../i18n';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = ['السيارة تهتز لما أفرمل', 'لمبة الزيت اشتغلت', 'المكيف ما يبرد زين', 'صوت غريب من المحرك', 'السيارة ما تشتغل الصبح'];
const MAX_CHARS = 1000;

/** شاشة مساعد السيارة: يشخّص المشكلة ويعطي حلول. المحادثة تنحفظ على الشاشة بس (ما نخزّنها). */
export default function ChatScreen() {
  const navigation = useNavigation();
  const { activeCar, cloud } = useStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const idRef = useRef(0);

  const scrollDown = () => setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);

  /** يرسل المحادثة للخادم. fromHistory: إعادة محاولة بدون إضافة رسالة جديدة */
  async function ask(history: Msg[]) {
    setLoading(true);
    setError(null);
    scrollDown();
    try {
      const { reply } = await remote.chat(history.map(({ role, content }) => ({ role, content })), activeCar?.id);
      setMessages((m) => [...m, { id: `a${++idRef.current}`, role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'صار خطأ، حاول مرة ثانية');
    } finally {
      setLoading(false);
      scrollDown();
    }
  }

  function send(text: string) {
    const content = text.trim().slice(0, MAX_CHARS);
    if (!content || loading) return;
    const next = [...messages, { id: `u${++idRef.current}`, role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    ask(next);
  }

  const canSend = input.trim().length > 0 && !loading;

  if (!cloud) {
    return (
      <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
        <View className="px-5 pt-2">
          <ScreenHeader title="مساعد السيارة" onBack={() => navigation.goBack()} />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="lock-closed-outline" size={36} color={COLORS.muted} />
          <Text className="mt-4 text-center text-lg font-bold text-white">سجّل دخول عشان تستخدم المساعد</Text>
          <Text className="mt-2 text-center text-sm leading-6 text-muted">المساعد يحتاج حساب عشان يعرف بيانات سيارتك ويحفظ حدود الاستخدام.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="px-5 pt-2">
          <ScreenHeader title="مساعد السيارة" subtitle={activeCar?.name} onBack={() => navigation.goBack()} />
        </View>

        <ScrollView ref={scroller} className="flex-1" contentContainerClassName="px-5 pb-4 pt-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {messages.length === 0 && (
            <View>
              <View className="rounded-card bg-card p-4">
                <Text className="text-base font-bold text-white">وصف المشكلة</Text>
                <Text className="mt-1 text-sm leading-6 text-muted">اكتب اللي يصير في سيارتك (صوت، ريحة، لمبة، اهتزاز) ومتى يصير، والمساعد يرتّب لك الأسباب المحتملة ويعطيك الحل.</Text>
              </View>
              <Text className="mb-2 mt-5 text-sm text-muted">جرّب سؤال من هذي:</Text>
              <View className="flex-row flex-wrap">
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => send(s)} className="mb-2 me-2 rounded-full bg-card px-4 py-2.5 active:opacity-70" accessibilityRole="button">
                    <Text className="text-sm text-white">{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {messages.map((m) => (
            <View key={m.id} className={`mb-3 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <View className={`max-w-[88%] rounded-card px-4 py-3 ${m.role === 'user' ? 'bg-accent' : 'bg-card'}`}>
                {/* رد المساعد نص حر، فنستخدم Text العادي (بدون ترجمة) */}
                <RNText selectable className={`text-base leading-6 ${m.role === 'user' ? 'text-ink' : 'text-white'}`} style={{ textAlign: 'auto' }}>
                  {m.content}
                </RNText>
              </View>
              {m.role === 'assistant' && m.id === messages[messages.length - 1]?.id && (
                <Pressable onPress={() => navigation.navigate('Workshops', {})} className="mt-2 flex-row items-center rounded-full border border-line px-3 py-1.5 active:opacity-70" accessibilityRole="button">
                  <Ionicons name="calendar-outline" size={14} color={COLORS.accent} />
                  <Text className="ms-1.5 text-xs font-semibold text-accent">احجز موعد في ورشة</Text>
                </Pressable>
              )}
            </View>
          ))}

          {loading && (
            <View className="mb-3 items-start">
              <View className="flex-row items-center rounded-card bg-card px-4 py-3">
                <ActivityIndicator size="small" color={COLORS.accent} />
                <Text className="ms-2 text-sm text-muted">يكتب…</Text>
              </View>
            </View>
          )}

          {error && (
            <View className="mb-3 rounded-card bg-status-critical/15 p-4" accessibilityRole="alert">
              <Text className="text-sm text-white">{error}</Text>
              <Pressable onPress={() => ask(messages)} className="mt-3 h-10 flex-row items-center self-start rounded-full bg-accent px-4 active:opacity-80">
                <Ionicons name="refresh" size={16} color={COLORS.ink} />
                <Text className="ms-1.5 text-sm font-bold text-ink">حاول مرة ثانية</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <View className="border-t border-line px-5 pb-2 pt-3">
          <View className="flex-row items-end">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={tr('اكتب مشكلة سيارتك…')}
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={MAX_CHARS}
              editable={!loading}
              accessibilityLabel="وصف المشكلة"
              className="max-h-28 min-h-12 flex-1 rounded-3xl bg-card px-4 py-3 text-base text-white"
              style={{ textAlign: 'auto' }}
            />
            <Pressable
              onPress={() => send(input)}
              disabled={!canSend}
              className={`ms-2 h-12 w-12 items-center justify-center rounded-full ${canSend ? 'bg-accent active:opacity-80' : 'bg-card-2'}`}
              accessibilityRole="button"
              accessibilityLabel="أرسل"
              accessibilityState={{ disabled: !canSend }}
            >
              <Ionicons name="arrow-up" size={22} color={canSend ? COLORS.ink : COLORS.gray} />
            </Pressable>
          </View>
          <Text className="mt-2 text-center text-[11px] text-muted">المساعد يعطي تقدير مو تشخيص نهائي — الورشة تأكد المشكلة.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
