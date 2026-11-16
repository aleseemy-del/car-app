import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import Text from '../components/common/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenHeader } from '../components/common';
import type { MCIconName } from '../components/dashboard';
import { useStore } from '../store/AppStore';
import type { DocType } from '../store/types';
import { askImageSource } from '../services/imagePicker';
import { daysUntil, formatDate, isValidISODate } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/tones';

type Props = NativeStackScreenProps<RootStackParamList, 'Documents'>;

const DOCS: { type: DocType; label: string; icon: MCIconName }[] = [
  { type: 'registration', label: 'دفتر السيارة', icon: 'book-open-variant' },
  { type: 'insurance', label: 'التأمين', icon: 'shield-car' },
  { type: 'license', label: 'رخصة القيادة', icon: 'card-account-details-outline' },
  { type: 'inspection', label: 'شهادة الفحص', icon: 'clipboard-check-outline' },
];

export default function DocumentsScreen({ navigation }: Props) {
  const { state, activeCar, upsertDocument } = useStore();
  const [viewing, setViewing] = useState<string>();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const docFor = (type: DocType) => state.documents.find((d) => d.carId === activeCar.id && d.type === type);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2" keyboardShouldPersistTaps="handled">
        <ScreenHeader title="أوراق السيارة" subtitle={activeCar.name} onBack={() => navigation.goBack()} />
        <Text className="mt-3 text-xs text-muted">الصور تنحفظ على جوالك بس.</Text>

        {DOCS.map(({ type, label, icon }) => {
          const doc = docFor(type);
          const draft = drafts[type] ?? doc?.expiry ?? '';
          const days = doc?.expiry ? daysUntil(doc.expiry) : null;
          const save = (patch: { imageUri?: string; expiry?: string }) =>
            upsertDocument({ id: doc?.id, carId: activeCar.id, type, imageUri: doc?.imageUri, expiry: doc?.expiry, ...patch });

          return (
            <View key={type} className="mt-4 rounded-card bg-card p-4">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => (doc?.imageUri ? setViewing(doc.imageUri) : askImageSource((uri) => save({ imageUri: uri })))}
                  className="h-16 w-16 items-center justify-center overflow-hidden rounded-tile bg-surface"
                >
                  {doc?.imageUri ? (
                    <Image source={{ uri: doc.imageUri }} className="h-full w-full" />
                  ) : (
                    <MaterialCommunityIcons name={icon} size={26} color={COLORS.ink} />
                  )}
                </Pressable>
                <View className="ms-3 flex-1">
                  <Text className="text-base font-bold text-white">{label}</Text>
                  <Text className={`mt-0.5 text-xs ${days !== null && days <= 30 ? 'text-accent' : 'text-muted'}`}>
                    {doc?.expiry ? (days! < 0 ? `منتهي ${formatDate(doc.expiry)}` : `ينتهي ${formatDate(doc.expiry)}`) : doc?.imageUri ? 'محفوظ' : 'اضغط على المربع لإضافة صورة'}
                  </Text>
                </View>
                {doc?.imageUri && (
                  <Pressable onPress={() => askImageSource((uri) => save({ imageUri: uri }))} accessibilityLabel="تغيير الصورة">
                    <Ionicons name="camera-outline" size={20} color={COLORS.muted} />
                  </Pressable>
                )}
              </View>
              <View className="mt-3 h-11 flex-row items-center rounded-tile bg-card-2 px-3">
                <Text className="text-xs text-muted">تاريخ الانتهاء</Text>
                <TextInput
                  value={draft}
                  onChangeText={(t) => setDrafts((d) => ({ ...d, [type]: t }))}
                  onEndEditing={() => isValidISODate(draft) && save({ expiry: draft })}
                  placeholder="2027-03-15"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numbers-and-punctuation"
                  className="ms-2 flex-1 text-sm text-white"
                  style={{ textAlign: 'left' }}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(undefined)}>
        <Pressable className="flex-1 items-center justify-center bg-black/90 p-5" onPress={() => setViewing(undefined)}>
          {viewing && <Image source={{ uri: viewing }} className="h-3/4 w-full" resizeMode="contain" />}
          <Text className="mt-4 text-sm text-muted">اضغط للإغلاق</Text>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
