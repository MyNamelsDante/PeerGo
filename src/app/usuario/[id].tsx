import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Label } from '../../components/atoms/Label';
import { CabecalhoPerfil } from '../../components/molecules/CabecalhoPerfil';
import { HistoricoServicos } from '../../components/molecules/HistoricoServicos';
import { listarHistorico, obterPerfil } from '../../services/bicos';
import { cores, espacamentos } from '../../theme';
import type { Bico, PerfilPublico } from '../../types';

// Perfil público de outro estudante: o que qualquer pessoa do app pode ver
export default function PerfilPublicoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [historico, setHistorico] = useState<Bico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    const numero = Number(id);

    Promise.all([obterPerfil(numero), listarHistorico(numero)])
      .then(([dadosPerfil, dadosHistorico]) => {
        if (!ativo) return;
        setPerfil(dadosPerfil);
        setHistorico(dadosHistorico);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  const cabecalho = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: perfil?.nome ?? 'Perfil',
        headerTintColor: '#FFFFFF',
        headerStyle: { backgroundColor: cores.marinho },
        headerTitleStyle: { color: '#FFFFFF' },
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  );

  if (carregando) {
    return (
      <View style={styles.centro}>
        {cabecalho}
        <ActivityIndicator color={cores.primaria} />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.centro}>
        {cabecalho}
        <Label variante="subtitulo">Perfil não encontrado</Label>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {cabecalho}

      <CabecalhoPerfil
        nome={perfil.nome}
        curso={perfil.curso}
        nota={perfil.nota}
        avaliacoes={perfil.avaliacoes}
        servicosPrestados={perfil.servicosPrestados}
      />

      <Label variante="subtitulo" style={styles.secao}>
        Histórico de serviços
      </Label>
      <HistoricoServicos bicos={historico} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, paddingBottom: espacamentos.xl * 2 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.sm,
    padding: espacamentos.lg,
    backgroundColor: cores.fundo,
  },
  secao: { marginTop: espacamentos.lg, marginBottom: espacamentos.sm },
});
