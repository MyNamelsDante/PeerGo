import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { CATEGORIAS } from '../../constants/categorias';
import { cores, espacamentos, raios, tipografia } from '../../theme';
import type { CategoriaId } from '../../types';

type FiltroCategoriasProps = {
  selecionada: CategoriaId | null; // null = "Todos" (ou nenhuma, se incluirTodos for false)
  onSelecionar: (categoria: CategoriaId | null) => void;
  incluirTodos?: boolean;
  semMargem?: boolean; // tira o recuo lateral (quando já está dentro de um container com padding)
};

export function FiltroCategorias({
  selecionada,
  onSelecionar,
  incluirTodos = true,
  semMargem = false,
}: FiltroCategoriasProps) {
  const opcoes: { id: CategoriaId | null; nome: string }[] = incluirTodos
    ? [{ id: null, nome: 'Todos' }, ...CATEGORIAS]
    : CATEGORIAS;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.lista, semMargem && styles.semMargem]}>
      {opcoes.map(opcao => {
        const ativa = opcao.id === selecionada;
        return (
          <Pressable
            key={opcao.id ?? 'todos'}
            onPress={() => onSelecionar(opcao.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativa }}
            style={[styles.chip, ativa && styles.chipAtivo]}>
            <Text style={[styles.texto, ativa && styles.textoAtivo]}>{opcao.nome}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: { gap: espacamentos.sm, paddingHorizontal: espacamentos.lg },
  semMargem: { paddingHorizontal: 0 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: espacamentos.md,
    borderRadius: raios.lg,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  texto: { fontSize: tipografia.legenda, fontWeight: '600', color: cores.texto },
  textoAtivo: { color: '#FFFFFF' },
});
