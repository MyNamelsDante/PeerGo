import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet } from 'react-native';

import { Button } from '../../components/atoms/Button';
import { Label } from '../../components/atoms/Label';
import {
  capturarFoto,
  enviarAvisoLocal,
  escolherImagem,
  obterPosicao,
  statusPermissoes,
  type Posicao,
  type StatusPermissoes,
} from '../../services/nativos';
import { cores, espacamentos, raios } from '../../theme';

export default function PerfilScreen() {
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const [permissoes, setPermissoes] = useState<StatusPermissoes | null>(null);

  async function atualizarPermissoes() {
    setPermissoes(await statusPermissoes());
  }

  useEffect(() => {
    atualizarPermissoes();
  }, []);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label variante="titulo">Meu perfil</Label>

      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.foto} />
      ) : (
        <Label variante="legenda" style={styles.espaco}>
          Nenhuma foto ainda
        </Label>
      )}

      <Button title="Tirar foto" onPress={tirarFoto} style={styles.botao} />
      <Button
        title="Escolher da galeria"
        variante="secundario"
        onPress={escolherDaGaleria}
        style={styles.botao}
      />

      <Button title="Ver minha localização" onPress={verLocalizacao} style={styles.botao} />
      {posicao && (
        <Label variante="legenda" style={styles.espaco}>
          {`Lat ${posicao.latitude.toFixed(5)}, Long ${posicao.longitude.toFixed(5)}`}
        </Label>
      )}

      <Button
        title="Enviar aviso"
        variante="secundario"
        onPress={avisar}
        style={styles.botao}
      />

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
  foto: {
    width: 160,
    height: 160,
    borderRadius: raios.lg,
    alignSelf: 'center',
    marginVertical: espacamentos.lg,
  },
  espaco: { marginVertical: espacamentos.md },
  botao: { marginTop: espacamentos.md },
  secao: { marginTop: espacamentos.xl, marginBottom: espacamentos.sm },
});