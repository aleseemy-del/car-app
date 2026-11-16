import { Children, createElement, type ReactNode } from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { useStore } from '../../store/AppStore';
import { tr } from '../../i18n';

/**
 * Text يترجم نفسه: أي نص عربي داخله يطلع بالإنجليزي لو اللغة إنجليزي.
 * الأجزاء النصية المتتالية تنضم قبل الترجمة عشان "بعد {x} كم" تنترجم صح.
 */
export default function Text({ children, ...props }: TextProps) {
  useStore(); // يعيد الرسم لما تتغير اللغة
  return createElement(RNText, props, ...translateChildren(children));
}

function translateChildren(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = '';
  const flush = () => {
    if (buf) out.push(tr(buf));
    buf = '';
  };
  Children.forEach(children, (c) => {
    if (typeof c === 'string' || typeof c === 'number') buf += String(c);
    else {
      flush();
      if (c != null && c !== false && c !== true) out.push(c);
    }
  });
  flush();
  return out;
}
