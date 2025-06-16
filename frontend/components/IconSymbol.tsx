import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';
import { FontAwesome } from '@expo/vector-icons';

export function IconSymbol({ style, name, color }: IconProps<ComponentProps<typeof FontAwesome>['name']>) {
  return <FontAwesome name={name} size={28} style={[{ color }, style]} />;
} 