import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '../../theme';

type TextAreaProps = TextInputProps & { erro?: boolean };

export function TextArea({ erro = false, style, ...rest }: TextAreaProps) {
  return (
    <TextInput
      placeholderTextColor={cores.textoSecundario}
      multiline
      textAlignVertical="top"
      style={[styles.base, erro && styles.erro, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 96,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
    fontSize: tipografia.corpo,
    color: cores.texto,
    backgroundColor: cores.superficie,
  },
  erro: { borderColor: cores.perigo },
});