import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { Label } from '../../../components/atoms/Label';
import { obterSessao, type Usuario } from '../../../services/auth';
import { obterBico, obterPerfil } from '../../../services/bicos';
import { enviarMensagem, obterConversa, outroParticipante } from '../../../services/chat';
import { cores, espacamentos, raios, tipografia } from '../../../theme';
import type { Bico, Conversa, Mensagem, PerfilPublico } from '../../../types';

export default function ConversaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listaRef = useRef<FlatList<Mensagem>>(null);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [contraparte, setContraparte] = useState<PerfilPublico | null>(null);
  const [bico, setBico] = useState<Bico | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      const sessao = await obterSessao();
      const dadosConversa = await obterConversa(id);
      if (!ativo) return;

      setUsuario(sessao);
      setConversa(dadosConversa);
      setMensagens(dadosConversa?.mensagens ?? []);

      if (sessao && dadosConversa) {
        const [perfil, dadosBico] = await Promise.all([
          obterPerfil(outroParticipante(dadosConversa, sessao.id)),
          obterBico(dadosConversa.bicoId),
        ]);
        if (!ativo) return;
        setContraparte(perfil);
        setBico(dadosBico);
      }
    })()
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  async function enviar() {
    if (!usuario || !conversa) return;
    setEnviando(true);
    try {
      const nova = await enviarMensagem(conversa.id, usuario.id, texto);
      setMensagens(atuais => [...atuais, nova]);
      setTexto('');
    } catch (e) {
      Alert.alert('Ops', e instanceof Error ? e.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  const titulo = contraparte?.nome ?? 'Conversa';

  const cabecalho = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: titulo,
        headerTintColor: cores.primaria,
        headerStyle: { backgroundColor: cores.superficie },
        headerTitleStyle: { color: cores.texto },
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

  if (!conversa || !usuario) {
    return (
      <View style={styles.centro}>
        {cabecalho}
        <Label variante="subtitulo">Conversa não encontrada</Label>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {cabecalho}

      {bico && (
        <View style={styles.faixa}>
          <Text style={styles.faixaTitulo} numberOfLines={1}>
            {bico.titulo}
          </Text>
          <Text style={styles.faixaAviso}>
            Combinem os detalhes por aqui. Contatos só são liberados quando o interesse for aceito pelos dois.
          </Text>
        </View>
      )}

      <FlatList
        ref={listaRef}
        data={mensagens}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.lista}
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const minha = item.autorId === usuario.id;
          return (
            <View style={[styles.balao, minha ? styles.balaoMeu : styles.balaoOutro]}>
              <Text style={[styles.balaoTexto, minha && styles.balaoTextoMeu]}>{item.texto}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Label variante="legenda">Nenhuma mensagem ainda. Diga um oi!</Label>
          </View>
        }
      />

      <View style={styles.entrada}>
        <Input
          placeholder="Escreva uma mensagem"
          value={texto}
          onChangeText={setTexto}
          maxLength={500}
          style={styles.campo}
        />
        <Button
          title="Enviar"
          onPress={enviar}
          carregando={enviando}
          desabilitado={!texto.trim()}
          style={styles.botaoEnviar}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.sm,
    padding: espacamentos.lg,
    backgroundColor: cores.fundo,
  },
  faixa: {
    paddingHorizontal: espacamentos.lg,
    paddingVertical: espacamentos.sm,
    backgroundColor: cores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: 2,
  },
  faixaTitulo: { fontSize: tipografia.legenda, fontWeight: '700', color: cores.primaria },
  faixaAviso: { fontSize: 12, color: cores.textoSecundario },
  lista: { flexGrow: 1, padding: espacamentos.md, gap: espacamentos.sm },
  vazio: { alignItems: 'center', marginTop: espacamentos.xl },
  balao: {
    maxWidth: '80%',
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
    borderRadius: raios.md,
  },
  balaoMeu: { alignSelf: 'flex-end', backgroundColor: cores.primaria, borderBottomRightRadius: 4 },
  balaoOutro: {
    alignSelf: 'flex-start',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderBottomLeftRadius: 4,
  },
  balaoTexto: { fontSize: tipografia.corpo, color: cores.texto },
  balaoTextoMeu: { color: '#FFFFFF' },
  entrada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    padding: espacamentos.md,
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  campo: { flex: 1 },
  botaoEnviar: { minWidth: 96, minHeight: 52 },
});
