import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';

import { Button } from '../../components/atoms/Button';
import { Label } from '../../components/atoms/Label';
import { CabecalhoPerfil } from '../../components/molecules/CabecalhoPerfil';
import { HistoricoServicos } from '../../components/molecules/HistoricoServicos';
import { obterSessao } from '../../services/auth';
import { listarHistorico, obterPerfil } from '../../services/bicos';
import {
  capturarFoto,
  enviarAvisoLocal,
  escolherImagem,
  obterPosicao,
  statusPermissoes,
  type Posicao,
  type StatusPermissoes,
} from '../../services/nativos';
import { cores, espacamentos } from '../../theme';
import type { Bico, PerfilPublico } from '../../types';

export default function PerfilScreen() {
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [historico, setHistorico] = useState<Bico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const [permissoes, setPermissoes] = useState<StatusPermissoes | null>(null);

  async function atualizarPermissoes() {
    setPermissoes(await statusPermissoes());
  }

  // Recarrega sempre que a aba volta a aparecer (avaliações e histórico podem ter mudado)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      (async () => {
        const sessao = await obterSessao();
        if (sessao) {
          const [dadosPerfil, dadosHistorico] = await Promise.all([
            obterPerfil(sessao.id),
            listarHistorico(sessao.id),
          ]);
          if (ativo) {
            setPerfil(dadosPerfil);
            setHistorico(dadosHistorico);
          }
        }
        await atualizarPermissoes();
      })()
        .catch(() => {})
        .finally(() => {
          if (ativo) setCarregando(false);
        });

      return () => {
        ativo = false;
      };
    }, []),
  );

  // Roda uma ação, mostra o erro (se der) e atualiza o status das permissões
  async function executar(acao: () => Promise<void>) {
    try {
      await acao();
    } catch (e) {
      Alert.alert('Ops', e instanceof Error ? e.message : 'Algo deu errado');
    } finally {
      await atualizarPermissoes();
    }
  }

  function tirarFoto() {
    executar(async () => {
      const foto = await capturarFoto();
      if (foto) setFotoUri(foto.uri);
    });
  }

  function escolherDaGaleria() {
    executar(async () => {
      const foto = await escolherImagem();
      if (foto) setFotoUri(foto.uri);
    });
  }

  function verLocalizacao() {
    executar(async () => {
      setPosicao(await obterPosicao());
    });
  }

  function avisar() {
    executar(async () => {
      await enviarAvisoLocal({
        titulo: 'PeerGo',
        corpo: 'Teste de notificação local',
      });
    });
  }

  if (carregando) {
    return (
      <ScrollView contentContainerStyle={[styles.container, styles.centro]}>
        <ActivityIndicator color={cores.primaria} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label variante="titulo">Meu perfil</Label>

      {perfil && (
        <CabecalhoPerfil
          nome={perfil.nome}
          curso={perfil.curso}
          nota={perfil.nota}
          avaliacoes={perfil.avaliacoes}
          servicosPrestados={perfil.servicosPrestados}
          fotoUri={fotoUri}
        />
      )}

      <Label variante="subtitulo" style={styles.secao}>
        Histórico recente
      </Label>
      <HistoricoServicos bicos={historico} />

      <Label variante="subtitulo" style={styles.secao}>
        Foto do perfil
      </Label>
      <Button title="Tirar foto" onPress={tirarFoto} />
      <Button title="Escolher da galeria" variante="secundario" onPress={escolherDaGaleria} style={styles.botao} />

      <Label variante="subtitulo" style={styles.secao}>
        Recursos do aparelho (teste)
      </Label>
      <Button title="Ver minha localização" onPress={verLocalizacao} />
      {posicao && (
        <Label variante="legenda" style={styles.espaco}>
          {`Lat ${posicao.latitude.toFixed(5)}, Long ${posicao.longitude.toFixed(5)}`}
        </Label>
      )}
      <Button title="Enviar aviso" variante="secundario" onPress={avisar} style={styles.botao} />

      {permissoes && (
        <>
          <Label variante="subtitulo" style={styles.secao}>
            Permissões
          </Label>
          <Label variante="legenda">{`Câmera: ${permissoes.camera}`}</Label>
          <Label variante="legenda">{`Galeria: ${permissoes.galeria}`}</Label>
          <Label variante="legenda">{`Localização: ${permissoes.localizacao}`}</Label>
          <Label variante="legenda">{`Notificações: ${permissoes.notificacoes}`}</Label>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: espacamentos.lg,
    paddingTop: espacamentos.xl * 2,
    backgroundColor: cores.fundo,
    flexGrow: 1,
  },
  centro: { justifyContent: 'center', alignItems: 'center' },
  secao: { marginTop: espacamentos.xl, marginBottom: espacamentos.sm },
  botao: { marginTop: espacamentos.md },
  espaco: { marginVertical: espacamentos.md },
});
