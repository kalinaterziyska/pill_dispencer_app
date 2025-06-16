/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Theme = 'light' | 'dark';
type ColorScheme = {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  border: string;
  inputBackground: string;
  placeholder: string;
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ColorScheme
) {
  const theme = (useColorScheme() ?? 'light') as Theme;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return (Colors[theme] as ColorScheme)[colorName];
  }
}
