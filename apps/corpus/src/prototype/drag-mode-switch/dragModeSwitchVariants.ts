export type DragModeSwitchVariantKey = 'A' | 'B' | 'C' | 'D';

export type DragModeSwitchVariant = {
  key: DragModeSwitchVariantKey;
  label: string;
  description: string;
};

export const DRAG_MODE_SWITCH_VARIANTS: DragModeSwitchVariant[] = [
  {
    key: 'A',
    label: 'Labeled switch',
    description: '「Drag」文字 + iOS 風格 toggle，放在 Close 左側',
  },
  {
    key: 'B',
    label: 'Icon toggle',
    description: '僅 grip 圖示按鈕，on 時 amber ring',
  },
  {
    key: 'C',
    label: 'Segmented control',
    description: 'Read | Drag 兩段式，模式互斥一目了然',
  },
  {
    key: 'D',
    label: 'Compact chip',
    description: '小 pill chip，呼應 context switcher 密度',
  },
];

export function dragModeSwitchVariantForKey(
  key: string | null,
): DragModeSwitchVariant {
  const found = DRAG_MODE_SWITCH_VARIANTS.find((entry) => entry.key === key);
  return found ?? DRAG_MODE_SWITCH_VARIANTS[0]!;
}

export function readDragModeSwitchVariantKey(): DragModeSwitchVariantKey {
  return dragModeSwitchVariantForKey(
    new URLSearchParams(window.location.search).get('variant'),
  ).key;
}
