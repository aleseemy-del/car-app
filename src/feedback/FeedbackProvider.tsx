import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../components/common/Text';
import { errorMessage, withTimeout } from './task';
import { COLORS } from '../theme/tones';

type RunOptions = { loadingText?: string; timeoutMs?: number; silent?: boolean };
type Feedback = {
  /** يشغّل عملية: يعرض "جاري التحميل"، ولو فشلت أو علقت يعرض الخطأ مع زر إعادة المحاولة */
  run: <T>(task: () => Promise<T>, opts?: RunOptions) => Promise<T | undefined>;
  showError: (message: string, retry?: () => void) => void;
};

const Ctx = createContext<Feedback | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; retry?: () => void } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showError = useCallback((message: string, retry?: () => void) => {
    setError({ message, retry });
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setError(null), retry ? 8000 : 4000);
  }, []);

  const run = useCallback<Feedback['run']>(
    async (task, opts = {}) => {
      setError(null);
      // ما نعرض التحميل للعمليات السريعة (أقل من 300ms) عشان ما تومض الشاشة
      clearTimeout(showTimer.current);
      if (!opts.silent) showTimer.current = setTimeout(() => setLoading(opts.loadingText ?? 'جاري التحميل…'), 300);
      try {
        return await withTimeout(task(), opts.timeoutMs);
      } catch (e) {
        showError(errorMessage(e), () => run(task, opts));
        return undefined;
      } finally {
        clearTimeout(showTimer.current);
        setLoading(null);
      }
    },
    [showError],
  );

  return (
    <Ctx.Provider value={{ run, showError }}>
      {children}

      {/* جاري التحميل */}
      <Modal visible={!!loading} transparent animationType="fade" statusBarTranslucent>
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="items-center rounded-card bg-card px-8 py-6">
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text className="mt-3 text-base text-white">{loading ?? ''}</Text>
          </View>
        </View>
      </Modal>

      {/* الخطأ */}
      {error && (
        <View className="absolute inset-x-4" style={{ top: insets.top + 8 }} pointerEvents="box-none">
          <View className="flex-row items-center rounded-card border border-status-critical/50 bg-card p-3.5">
            <Ionicons name="alert-circle" size={22} color="#FF453A" />
            <Text className="ms-2 flex-1 text-sm text-white">{error.message}</Text>
            {error.retry && (
              <Pressable
                onPress={() => { const r = error.retry; setError(null); r?.(); }}
                className="ms-2 rounded-full bg-accent px-3 py-1.5"
              >
                <Text className="text-xs font-bold text-ink">حاول مرة ثانية</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setError(null)} className="ms-1 p-1" accessibilityLabel="إغلاق">
              <Ionicons name="close" size={18} color={COLORS.muted} />
            </Pressable>
          </View>
        </View>
      )}
    </Ctx.Provider>
  );
}

export function useFeedback() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFeedback must be inside FeedbackProvider');
  return c;
}
