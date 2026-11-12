import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/atoms/Button';
import { Label } from '../../components/atoms/Label';
import { BicoCard } from '../../components/molecules/BicoCard';
import { FiltroCategorias } from '../../components/molecules/FiltroCategorias';
import { logout, obterSessao, type Usuario } from '../../services/auth';
import { listarBicos } from '../../services/bicos';
import { cores, espacamentos } from '../../theme';
import type { Bico, CategoriaId } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [categoria, setCategoria] = useState<CategoriaId | null>(null);
  const [bicos, setBicos] = useState<Bico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    obterSessao().then(setUsuario);
  }, []);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setBicos(await listarBicos({ categoria }));
    } catch {
      setErro('Não foi possível carregar os bicos.');
    }
  }, [categoria]);

  // Recarrega sempre que a aba volta a aparecer (ex.: depois de criar um bico)
  // e sempre que o filtro de categoria muda
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      carregar().finally(() => {
        if (ativo) setCarregando(false);
      });
      return () => {
        ativo = false;
      };
    }, [carregar]),
  );

  async function puxarParaAtualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  async function sair() {
    await logout();
    router.replace('/(auth)/login');
  }

  function abrirBico(id: string) {
    router.push({ pathname: '/bico/[id]', params: { id } });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + espacamentos.md }]}>
      <View style={styles.cabecalho}>
        <View style={styles.saudacao}>
          <Label variante="legenda">{usuario ? `Olá, ${usuario.nome.split(' ')[0]}` : ' '}</Label>
          <Label variante="titulo">Mural de bicos</Label>
        </View>
        <Pressable onPress={sair} accessibilityRole="button" hitSlop={12}>
          <Label variante="legenda" style={styles.sair}>
            Sair
          </Label>
        </Pressable>
      </View>

      <View style={styles.filtros}>
        <FiltroCategorias selecionada={categoria} onSelecionar={setCategoria} />
      </View>

      {carregando ? (
        <ActivityIndicator color={cores.primaria} style={styles.carregando} />
      ) : erro ? (
        <View style={styles.vazio}>
          <Label variante="legenda">{erro}</Label>
          <Button title="Tentar de novo" variante="secundario" onPress={puxarParaAtualizar} style={styles.botao} />
        </View>
      ) : (
        <FlatList
          data={bicos}
          keyExtractor={b => b.id}
          renderItem={({ item }) => <BicoCard bico={item} onPress={() => abrirBico(item.id)} />}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={puxarParaAtualizar}
              colors={[cores.primaria]}
              tintColor={cores.primaria}
            />
          }
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Label variante="subtitulo">Nenhum bico por aqui</Label>
              <Label variante="legenda">
                {categoria ? 'Tente outra categoria.' : 'Seja o primeiro a publicar um bico!'}
              </Label>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: espacamentos.lg,
  },
  saudacao: { flex: 1 },
  sair: { color: cores.primaria, fontWeight: '600', paddingTop: espacamentos.xs },
  filtros: { marginVertical: espacamentos.md },
  carregando: { marginTop: espacamentos.xl },
  lista: {
    gap: espacamentos.md,
    paddingHorizontal: espacamentos.lg,
    paddingBottom: espacamentos.xl,
    flexGrow: 1,
  },
  vazio: { alignItems: 'center', gap: espacamentos.sm, marginTop: espacamentos.xl },
  botao: { marginTop: espacamentos.md },
});
