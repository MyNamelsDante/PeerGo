import { StyleSheet, Text, TextProps } from 'react-native';

import { cores, tipografia } from '../../theme';

type LabelProps = TextProps & {
  variante?: 'titulo' | 'subtitulo' | 'corpo' | 'legenda';
  claro?: boolean; // texto branco, para fundos escuros
};

export function Label({ children, variante = 'corpo', claro = false, style, ...props }: LabelProps) {
  return (
    <Text style={[styles[variante], claro && styles.claro, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: tipografia.titulo, fontWeight: '700', color: cores.texto },
  subtitulo: { fontSize: tipografia.subtitulo, fontWeight: '600', color: cores.texto },
  corpo: { fontSize: tipografia.corpo, color: cores.texto },
  legenda: { fontSize: tipografia.legenda, color: cores.textoSecundario },
  claro: { color: '#FFFFFF' },
});