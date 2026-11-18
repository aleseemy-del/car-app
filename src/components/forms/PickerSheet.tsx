import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native';
import Text from '../common/Text';
import SafeAreaView from '../common/SafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import { matches } from '../../data/carCatalog';
import { COLORS } from '../../theme/tones';
import { tr } from '../../i18n';

export type PickerItem = { key: string; label: string; sub?: string; section?: string };

type Props = {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selectedKey?: string;
  searchPlaceholder?: string;
  /** يسمح بكتابة قيمة غير موجودة في القائمة */
  allowCustom?: boolean;
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
};

/** قائمة اختيار تطلع من تحت — فيها بحث، وأقسام، وخيار "اكتبه بنفسك" */
export default function PickerSheet({ visible, title, items, selectedKey, searchPlaceholder = 'ابحث', allowCustom, onSelect, onClose }: Props) {
  const [q, setQ] = useState('');
  const [custom, setCustom] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setQ('');
      setCustom(null);
    }
  }, [visible]);

  const filtered = useMemo(() => items.filter((i) => matches(q, i.label, i.sub ?? '')), [items, q]);

  const pick = (item: PickerItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
            <Text className="text-xl font-bold text-white">{title}</Text>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-surface" accessibilityLabel="إغلاق">
              <Ionicons name="close" size={20} color={COLORS.ink} />
            </Pressable>
          </View>

          {custom === null ? (
            <>
              <View className="mx-5 mb-2 h-12 flex-row items-center rounded-tile bg-card px-4">
                <Ionicons name="search" size={18} color={COLORS.muted} />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder={tr(searchPlaceholder)}
                  placeholderTextColor={COLORS.gray}
                  className="ms-2 flex-1 text-base text-white"
                  autoCorrect={false}
                />
              </View>

              <FlatList
                data={filtered}
                keyExtractor={(i) => i.key}
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="px-5 pb-6"
                renderItem={({ item, index }) => {
                  const showSection = !q && item.section && item.section !== filtered[index - 1]?.section;
                  const on = item.key === selectedKey;
                  return (
                    <>
                      {showSection && <Text className="mb-2 mt-4 text-xs font-bold text-muted">{item.section}</Text>}
                      <Pressable onPress={() => pick(item)} className={`mb-1.5 h-12 flex-row items-center rounded-tile px-4 active:opacity-80 ${on ? 'bg-accent' : 'bg-card'}`}>
                        <Text className={`flex-1 text-base ${on ? 'font-bold text-ink' : 'text-white'}`}>{item.label}</Text>
                        {/* بالإنجليزي الاسم والفرعي نفس الشي — نخفي التكرار */}
                        {item.sub && tr(item.label) !== item.sub && <Text className={`text-sm ${on ? 'text-ink' : 'text-muted'}`}>{item.sub}</Text>}
                      </Pressable>
                    </>
                  );
                }}
                ListEmptyComponent={<Text className="py-8 text-center text-sm text-muted">ما لقينا "{q}"</Text>}
                ListFooterComponent={
                  allowCustom ? (
                    <Pressable onPress={() => setCustom(q)} className="mt-3 h-12 flex-row items-center justify-center rounded-tile border border-line">
                      <Ionicons name="create-outline" size={18} color={COLORS.accent} />
                      <Text className="ms-2 text-sm font-bold text-accent">مو موجودة؟ اكتبها بنفسك</Text>
                    </Pressable>
                  ) : undefined
                }
              />
            </>
          ) : (
            <View className="px-5 pt-2">
              <View className="h-12 flex-row items-center rounded-tile bg-card px-4">
                <TextInput
                  value={custom}
                  onChangeText={setCustom}
                  autoFocus
                  placeholder={tr('اكتب الاسم')}
                  placeholderTextColor={COLORS.gray}
                  className="flex-1 text-base text-white"
                />
              </View>
              <Pressable
                onPress={() => custom.trim() && pick({ key: `custom:${custom.trim()}`, label: custom.trim() })}
                className="mt-4 h-12 items-center justify-center rounded-full bg-accent"
              >
                <Text className="text-base font-bold text-ink">تم</Text>
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
