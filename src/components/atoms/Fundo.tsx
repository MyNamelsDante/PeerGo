import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type FundoProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Fundo em degradê do app: azul-marinho em cima, menta embaixo (como no Figma)
export function Fundo({ children, style }: FundoProps) {
  return (
    <LinearGradient
      colors={['#0E3A5E', '#2A7F86', '#7FE3C4']}
      locations={[0, 0.5, 1]}
      style={[{ flex: 1 }, style]}>
      {children}
    </LinearGradient>
  );
}
