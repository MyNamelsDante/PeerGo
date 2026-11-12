import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Label } from '../../../components/atoms/Label';
import { obterSessao } from '../../../services/auth';
import { obterBico, obterPerfil } from '../../../services/bicos';
import { listarConversas, outroParticipante } from '../../../services/chat';
import { cores, espacamentos, raios, tipografia } from '../../../theme';
import type { Mensagem } from '../../../types';

type LinhaConversa = {
  id: string;
  nome: string;
  bicoTitulo: string;
  ultima: Mensagem | null;
  previa: string;
};

function hora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ListaConversasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [linhas, setLinhas] = useState<LinhaConversa[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Recarrega sempre que a aba volta a aparecer, para mostrar mensagens novas
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      (async () => {
        const usuario = await obterSessao();
        if (!usuario) {
          if (ativo) setLinhas([]);
          return;
        }
        const conversas = await listarConversas(usuario.id);
        const montadas = await Promise.all(
          conversas.map(async c => {
            const outro = outroParticipante(c, usuario.id);
            const [perfil, bico] = await Promise.all([obterPerfil(outro), obterBico(c.bicoId)]);
            const ultima = c.mensagens[c.mensagens.length - 1] ?? null;
            const previa = ultima
              ? `${ultima.autorId === usuario.id ? 'Você: ' : ''}${ultima.texto}`
              : 'Sem mensagens ainda';
            return {
              id: c.id,
              nome: perfil?.nome ?? 'Usuário',
              bicoTitulo: bico?.titulo ?? 'Bico removido',
              ultima,
              previa,
            };
          }),
        );
        if (ativo) setLinhas(montadas);
      })()
        .catch(() => {
          if (ativo) setLinhas([]);
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });

      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <View style={[styles.tela, { paddingTop: insets.top + espacamentos.md }]}>
      <View style={styles.cabecalho}>
        <Label variante="titulo">Conversas</Label>
      </View>

      {carregando ? (
        <ActivityIndicator color={cores.primaria} style={styles.carregando} />
      ) : (
        <FlatList
          data={linhas}
          keyExtractor={l => l.id}
          contentContainerStyle={styles.lista}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/(tabs)/chat/[id]', params: { id: item.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Conversa com ${item.nome} sobre ${item.bicoTitulo}`}
              style={({ pressed }) => [styles.linha, pressed && styles.pressionado]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{item.nome.charAt(0)}</Text>
              </View>
              <View style={styles.textos}>
                <View style={styles.topoLinha}>
                  <Text style={styles.nome} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  {item.ultima && <Text style={styles.hora}>{hora(item.ultima.enviadaEm)}</Text>}
                </View>
                <Text style={styles.bico} numberOfLines={1}>
                  {item.bicoTitulo}
                </Text>
                <Text style={styles.previa} numberOfLines={1}>
                  {item.previa}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Label variante="subtitulo">Nenhuma conversa ainda</Label>
              <Label variante="legenda" style={styles.centro}>
                Quando um contratante aceitar seu interesse em um bico, a conversa aparece aqui.
              </Label>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: { paddingHorizontal: espacamentos.lg, marginBottom: espacamentos.md },
  carregando: { marginTop: espacamentos.xl },
  lista: { flexGrow: 1, paddingBottom: espacamentos.xl },
  separador: { height: 1, backgroundColor: cores.borda, marginLeft: 76 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    paddingHorizontal: espacamentos.lg,
    paddingVertical: espacamentos.md,
    backgroundColor: cores.superficie,
  },
  pressionado: { opacity: 0.85 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: '#FFFFFF', fontSize: tipografia.subtitulo, fontWeight: '700' },
  textos: { flex: 1, gap: 2 },
  topoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { flex: 1, fontSize: tipografia.corpo, fontWeight: '600', color: cores.texto, marginRight: espacamentos.sm },
  hora: { fontSize: tipografia.legenda, color: cores.textoSecundario },
  bico: { fontSize: tipografia.legenda, color: cores.primaria, fontWeight: '600' },
  previa: { fontSize: tipografia.legenda, color: cores.textoSecundario },
  vazio: { alignItems: 'center', gap: espacamentos.sm, marginTop: espacamentos.xl, paddingHorizontal: espacamentos.lg },
  centro: { textAlign: 'center' },
});
