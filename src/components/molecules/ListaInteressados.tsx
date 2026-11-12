import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { cores, espacamentos } from '../../theme';
import { aceitarInteresse, listarInteressados, obterPerfil, type StatusInteresse } from '../../services/bicos';
import type { PerfilPublico } from '../../types';
import { Button } from '../atoms/Button';
import { Estrelas } from '../atoms/Estrelas';
import { Label } from '../atoms/Label';

type ListaInteressadosProps = {
  bicoId: string;
  contratanteId: number; // quem publicou o bico (só ele aceita)
  onMudou: () => void; // avisa a tela para recarregar o bico depois de aceitar
};

type Item = {
  usuarioId: number;
  status: StatusInteresse;
  perfil: PerfilPublico | null;
};

export function ListaInteressados({ bicoId, contratanteId, onMudou }: ListaInteressadosProps) {
  const router = useRouter();
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aceitandoId, setAceitandoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    const interesses = await listarInteressados(bicoId);
    const montados = await Promise.all(
      interesses.map(async i => ({
        usuarioId: i.usuarioId,
        status: i.status ?? 'pendente',
        perfil: await obterPerfil(i.usuarioId),
      })),
    );
    setItens(montados);
  }, [bicoId]);

  useEffect(() => {
    carregar()
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [carregar]);

  function confirmarAceite(usuarioId: number, nome: string) {
    Alert.alert(
      'Aceitar interesse',
      `Aceitar ${nome} para este bico? Os outros interessados serão recusados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceitar', onPress: () => aceitar(usuarioId, nome) },
      ],
    );
  }

  async function aceitar(usuarioId: number, nome: string) {
    setAceitandoId(usuarioId);
    try {
      const conversa = await aceitarInteresse(bicoId, usuarioId, contratanteId);
      await carregar();
      onMudou();
      Alert.alert('Interesse aceito!', `Você e ${nome} já podem conversar pelo chat.`, [
        { text: 'Depois', style: 'cancel' },
        {
          text: 'Ir para o chat',
          onPress: () => router.push({ pathname: '/(tabs)/chat/[id]', params: { id: conversa.id } }),
        },
      ]);
    } catch (e) {
      Alert.alert('Ops', e instanceof Error ? e.message : 'Não foi possível aceitar o interesse.');
    } finally {
      setAceitandoId(null);
    }
  }

  return (
    <View style={styles.bloco}>
      <Label variante="subtitulo">{`Interessados (${itens.length})`}</Label>

      {carregando ? (
        <ActivityIndicator color={cores.primaria} />
      ) : itens.length === 0 ? (
        <Label variante="legenda">Ainda ninguém demonstrou interesse.</Label>
      ) : (
        itens.map(item => {
          const nome = item.perfil?.nome ?? 'Usuário';
          return (
            <View key={item.usuarioId} style={styles.item}>
              <Pressable
                onPress={() => router.push({ pathname: '/usuario/[id]', params: { id: String(item.usuarioId) } })}
                accessibilityRole="link"
                accessibilityLabel={`Ver perfil de ${nome}`}
                style={styles.pessoa}>
                <Label style={styles.nome}>{nome}</Label>
                {item.perfil?.curso ? <Label variante="legenda">{item.perfil.curso}</Label> : null}
                {item.perfil && <Estrelas nota={item.perfil.nota} avaliacoes={item.perfil.avaliacoes} />}
              </Pressable>

              {item.status === 'pendente' && (
                <Button
                  title="Aceitar"
                  onPress={() => confirmarAceite(item.usuarioId, nome)}
                  carregando={aceitandoId === item.usuarioId}
                  desabilitado={aceitandoId !== null}
                  style={styles.botao}
                />
              )}
              {item.status === 'aceito' && <Label style={styles.aceito}>Aceito ✓</Label>}
              {item.status === 'recusado' && <Label variante="legenda">Recusado</Label>}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { marginTop: espacamentos.lg, gap: espacamentos.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    padding: espacamentos.md,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
  },
  pessoa: { flex: 1, gap: 2 },
  nome: { fontWeight: '600' },
  botao: { minHeight: 44, minWidth: 104 },
  aceito: { color: cores.sucesso, fontWeight: '700' },
});
