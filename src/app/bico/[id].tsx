import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/atoms/Button';
import { Estrelas } from '../../components/atoms/Estrelas';
import { Label } from '../../components/atoms/Label';
import { ListaInteressados } from '../../components/molecules/ListaInteressados';
import { obterCategoria } from '../../constants/categorias';
import { obterSessao, type Usuario } from '../../services/auth';
import {
  contarInteressados,
  jaTemInteresse,
  manifestarInteresse,
  obterBico,
  obterPerfil,
} from '../../services/bicos';
import { cores, espacamentos, raios, tipografia } from '../../theme';
import type { Bico, PerfilPublico } from '../../types';
import { formatarDataCompleta, formatarMoeda } from '../../utils/formatar';

export default function DetalhesBicoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bico, setBico] = useState<Bico | null>(null);
  const [contratante, setContratante] = useState<PerfilPublico | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [interessado, setInteressado] = useState(false);
  const [interessados, setInteressados] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const [dadosBico, sessao] = await Promise.all([obterBico(id), obterSessao()]);
      if (!dadosBico) return { dadosBico, sessao, perfil: null, jaInteressado: false, total: 0 };

      const [perfil, jaInteressado, total] = await Promise.all([
        obterPerfil(dadosBico.contratanteId),
        sessao ? jaTemInteresse(dadosBico.id, sessao.id) : Promise.resolve(false),
        contarInteressados(dadosBico.id),
      ]);
      return { dadosBico, sessao, perfil, jaInteressado, total };
    }

    carregar()
      .then(r => {
        if (!ativo) return;
        setBico(r.dadosBico);
        setUsuario(r.sessao);
        setContratante(r.perfil);
        setInteressado(r.jaInteressado);
        setInteressados(r.total);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  async function tenhoInteresse() {
    if (!bico || !usuario) return;
    setEnviando(true);
    try {
      await manifestarInteresse(bico.id, usuario.id);
      setInteressado(true);
      setInteressados(n => n + 1);
      Alert.alert(
        'Interesse enviado!',
        'O contratante vai ser avisado. Se ele aceitar, vocês poderão conversar pelo chat.',
      );
    } catch (e) {
      Alert.alert('Ops', e instanceof Error ? e.message : 'Não foi possível enviar seu interesse.');
    } finally {
      setEnviando(false);
    }
  }

  // Recarrega o bico e a contagem depois que o contratante aceita alguém
  async function recarregarBico() {
    const [dadosBico, total] = await Promise.all([obterBico(id), contarInteressados(id)]);
    setBico(dadosBico);
    setInteressados(total);
  }

  const cabecalho = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: 'Detalhes do bico',
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

  if (!bico) {
    return (
      <View style={styles.centro}>
        {cabecalho}
        <Label variante="subtitulo">Bico não encontrado</Label>
        <Label variante="legenda">Ele pode ter sido removido.</Label>
        <Button title="Voltar" variante="secundario" onPress={() => router.back()} style={styles.botaoVoltar} />
      </View>
    );
  }

  const categoria = obterCategoria(bico.categoria);
  const ehMeuBico = usuario?.id === bico.contratanteId;
  const disponivel = bico.status === 'aberto';

  return (
    <View style={styles.tela}>
      {cabecalho}

      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={[styles.selo, { backgroundColor: categoria.cor }]}>
          <Text style={styles.seloTexto}>{categoria.nome}</Text>
        </View>

        <Label variante="titulo">{bico.titulo}</Label>
        <Text style={styles.valor}>{formatarMoeda(bico.valor)}</Text>

        <View style={styles.infos}>
          <Info icone={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} texto={bico.bairro} />
          <Info
            icone={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
            texto={`Prazo: ${formatarDataCompleta(bico.prazo)}`}
          />
          <Info
            icone={{ ios: 'person.2', android: 'group', web: 'group' }}
            texto={interessados === 1 ? '1 interessado' : `${interessados} interessados`}
          />
        </View>

        <Label variante="subtitulo" style={styles.secao}>
          Descrição
        </Label>
        <Label style={styles.descricao}>{bico.descricao}</Label>

        {ehMeuBico && usuario && (
          <ListaInteressados bicoId={bico.id} contratanteId={usuario.id} onMudou={recarregarBico} />
        )}

        {contratante && (
          <>
            <Label variante="subtitulo" style={styles.secao}>
              Publicado por
            </Label>
            <Pressable
              onPress={() => router.push({ pathname: '/usuario/[id]', params: { id: String(contratante.id) } })}
              accessibilityRole="button"
              accessibilityLabel={`Ver perfil de ${contratante.nome}`}
              style={({ pressed }) => [styles.contratante, pressed && styles.pressionado]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{contratante.nome.charAt(0)}</Text>
              </View>
              <View style={styles.contratanteInfo}>
                <Label style={styles.nome}>{ehMeuBico ? 'Você' : contratante.nome}</Label>
                <Label variante="legenda">{contratante.curso}</Label>
                <Estrelas nota={contratante.nota} avaliacoes={contratante.avaliacoes} />
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                tintColor={cores.textoSecundario}
                size={20}
              />
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={[styles.rodape, { paddingBottom: insets.bottom + espacamentos.md }]}>
        {ehMeuBico ? (
          <Label variante="legenda" style={styles.aviso}>
            Este bico é seu. Você será avisado quando alguém demonstrar interesse.
          </Label>
        ) : (
          <>
            <Button
              title={interessado ? 'Interesse enviado ✓' : disponivel ? 'Tenho Interesse' : 'Indisponível'}
              onPress={tenhoInteresse}
              carregando={enviando}
              desabilitado={interessado || !disponivel || !usuario}
            />
            <Label variante="legenda" style={styles.aviso}>
              Por segurança, os contatos só são liberados quando o interesse for aceito pelos dois.
            </Label>
          </>
        )}
      </View>
    </View>
  );
}

function Info({ icone, texto }: { icone: SymbolViewProps['name']; texto: string }) {
  return (
    <View style={styles.info}>
      <SymbolView name={icone} tintColor={cores.textoSecundario} size={18} />
      <Label variante="legenda" style={styles.infoTexto}>
        {texto}
      </Label>
    </View>
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
  botaoVoltar: { marginTop: espacamentos.md, alignSelf: 'stretch' },
  conteudo: { padding: espacamentos.lg, gap: espacamentos.sm },
  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.sm,
    paddingVertical: espacamentos.xs,
    borderRadius: raios.sm,
  },
  seloTexto: { fontSize: tipografia.legenda, fontWeight: '600', color: cores.texto },
  valor: { fontSize: tipografia.titulo, fontWeight: '700', color: cores.sucesso },
  infos: { gap: espacamentos.sm, marginTop: espacamentos.sm },
  info: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  infoTexto: { fontSize: tipografia.corpo },
  secao: { marginTop: espacamentos.lg },
  descricao: { lineHeight: 24 },
  contratante: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    padding: espacamentos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  pressionado: { opacity: 0.85 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: '#FFFFFF', fontSize: tipografia.subtitulo, fontWeight: '700' },
  contratanteInfo: { flex: 1, gap: 2 },
  nome: { fontWeight: '600' },
  rodape: {
    paddingHorizontal: espacamentos.lg,
    paddingTop: espacamentos.md,
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: espacamentos.sm,
  },
  aviso: { textAlign: 'center' },
});
