import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '../../theme';

type InputProps = TextInputProps & { erro?: boolean };

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { erro = false, style, onFocus, onBlur, ...props },
  ref,
) {
  const [focado, setFocado] = useState(false);

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={cores.textoSecundario}
      {...props}
      style={[styles.input, focado && styles.focado, erro && styles.comErro, style]}
      onFocus={evento => {
        setFocado(true);
        onFocus?.(evento);
      }}
      onBlur={evento => {
        setFocado(false);
        onBlur?.(evento);
      }}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.md,
    fontSize: tipografia.corpo,
    color: cores.texto,
  },
  focado: { borderColor: cores.bordaFoco },
  comErro: { borderColor: cores.perigo },
});