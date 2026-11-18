import { View, type ViewProps } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

/**
 * نسخة الويب: المتصفح ما عنده نوتش، وSafeAreaView الأصلي على الويب يكتب padding=0 داخل style
 * فيلغي padding اللي جاي من className (مثل px-6). فنستخدم View عادي ونتجاهل edges.
 */
export default function SafeAreaView({ edges: _edges, mode: _mode, ...props }: ViewProps & { edges?: readonly Edge[]; mode?: 'padding' | 'margin' }) {
  return <View {...props} />;
}
