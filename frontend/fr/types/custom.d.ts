/// <reference types="react" />

declare module '@/constants/Colors' {
  interface ColorScheme {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
    border: string;
  }

  interface Colors {
    light: ColorScheme;
    dark: ColorScheme;
  }

  const Colors: Colors;
  export { Colors };
}

declare module '@/components/ThemedView' {
  interface ViewStyle {
    [key: string]: any;
  }

  interface ThemedViewProps {
    style?: ViewStyle;
    children?: any;
  }

  export const ThemedView: (props: ThemedViewProps) => JSX.Element;
}

declare module '@/components/ThemedText' {
  interface TextStyle {
    [key: string]: any;
  }

  interface ThemedTextProps {
    style?: TextStyle;
    type?: 'title' | 'body' | 'caption';
    children?: any;
  }

  export const ThemedText: (props: ThemedTextProps) => JSX.Element;
}

declare module '@/components/ParallaxScrollView' {
  interface ParallaxScrollViewProps {
    headerBackgroundColor: {
      light: string;
      dark: string;
    };
    headerImage: any;
    children?: any;
  }

  const ParallaxScrollView: (props: ParallaxScrollViewProps) => JSX.Element;
  export default ParallaxScrollView;
}

declare module '@/components/ui/IconSymbol' {
  interface IconSymbolProps {
    name: string;
    size: number;
    color: string;
  }

  export const IconSymbol: (props: IconSymbolProps) => JSX.Element;
} 