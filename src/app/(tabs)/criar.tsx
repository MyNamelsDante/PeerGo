import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Label } from '../../components/atoms/Label';
import { TextArea } from '../../components/atoms/TextArea';
import { FiltroCategorias } from '../../components/molecules/FiltroCategorias';
import { obterSessao } from '../../services/auth';
import { criarBico } from '../../services/bicos';
import { obterBairroAtual } from '../../services/nativos';
import { cores, espacamentos, raios, tipografia } from '../../theme';
import type { CategoriaId } from '../../types';
import { formatarDataCompleta } from '../../utils/formatar';

// Opções rápidas de prazo (evita depender de um seletor de data nativo)
const PRAZOS = [
  { dias: 0, nome: 'Hoje' },
  { dias: 1, nome: 'Amanhã' },
  { dias: 3, nome: 'Em 3 dias' },
  { dias: 7, nome: 'Em 1 semana' },
  { dias: 14, nome: 'Em 2 semanas' },
];

// Data local daqui a N dias no formato AAAA-MM-DD
function dataDaquiA(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Aceita "80", "80,50", "80.50" e "1.200,00"
function lerValor(texto: string): number {
  const limpo = texto.replace(/[^\d,.]/g, '');
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  return Number(normalizado);
}

type Erros = Partial<Record<'titulo' | 'categoria' | 'descricao' | 'valor' | 'bairro' | 'prazo', string>>;

export default function CriarBicoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaId | null>(null);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [bairro, setBairro] = useState('');
  const [prazoDias, setPrazoDias] = useState<number | null>(null);

  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [localizando, setLocalizando] = useState(false);

  function validar(): Erros {
    const e: Erros = {};
    const numero = lerValor(valor);
    if (titulo.trim().length < 5) e.titulo = 'Escreva um título com pelo menos 5 letras.';
    if (!categoria) e.categoria = 'Escolha uma categoria.';
    if (descricao.trim().length < 15) e.descricao = 'Conte um pouco mais (mínimo 15 caracteres).';
    if (!valor.trim() || !Number.isFinite(numero) || numero <= 0) e.valor = 'Informe um valor maior que zero.';
    else if (numero > 5000) e.valor = 'O valor máximo é R$ 5.000,00.';
    if (!bairro.trim()) e.bairro = 'Informe o bairro.';
    if (prazoDias === null) e.prazo = 'Escolha um prazo.';
    return e;
  }

  async function usarLocalizacao() {
    setLocalizando(true);
    try {
      const encontrado = await obterBairroAtual();
      if (encontrado) {
        setBairro(encontrado);
        setErros(e => ({ ...e, bairro: undefined }));
      } else {
        Alert.alert('Ops', 'Não conseguimos descobrir seu bairro. Digite manualmente.');
      }
    } catch (e) {
      Alert.alert('Ops', e instanceof Error ? e.message : 'Não foi possível obter sua localização.');
    } finally {
      setLocalizando(false);
    }
  }

  function limpar() {
    setTitulo('');
    setCategoria(null);
    setDescricao('');
    setValor('');
    setBairro('');
    setPrazoDias(null);
    setErros({});
  }

  async function publicar() {
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const usuario = await obterSessao();
      if (!usuario) {
        router.replace('/(auth)/login');
        return;
      }
      const novo = await criarBico(
        {
          titulo: titulo.trim(),
          categoria: categoria!,
          descricao: descricao.trim(),
          valor: lerValor(valor),
          bairro: bairro.trim(),
          prazo: dataDaquiA(prazoDias!),
        },
        usuario.id,
      );
      limpar();
      Alert.alert('Bico publicado!', 'Ele já aparece no mural para os outros estudantes.');
      router.push({ pathname: '/bico/[id]', params: { id: novo.id } });
    } catch (e) {
      Alert.alert('Ops', e instanceof Error ? e.message : 'Não foi possível publicar o bico.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.conteudo, { paddingTop: insets.top + espacamentos.md }]}
        keyboardShouldPersistTaps="handled">
        <Label variante="titulo">Criar bico</Label>
        <Label variante="legenda">Descreva o que você precisa. Leva menos de um minuto.</Label>

        <Campo titulo="Título" erro={erros.titulo}>
          <Input
            placeholder="Ex.: Formatar TCC nas normas ABNT"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={60}
            erro={!!erros.titulo}
          />
        </Campo>

        <Campo titulo="Categoria" erro={erros.categoria}>
          <FiltroCategorias
            selecionada={categoria}
            onSelecionar={setCategoria}
            incluirTodos={false}
            semMargem
          />
        </Campo>

        <Campo titulo="Descrição" erro={erros.descricao}>
          <TextArea
            placeholder="O que precisa ser feito, onde, por quanto tempo..."
            value={descricao}
            onChangeText={setDescricao}
            maxLength={500}
            erro={!!erros.descricao}
          />
          <Label variante="legenda" style={styles.contador}>
            {`${descricao.length}/500`}
          </Label>
        </Campo>

        <Campo titulo="Valor oferecido" erro={erros.valor}>
          <View style={styles.valorLinha}>
            <Text style={styles.prefixo}>R$</Text>
            <Input
              placeholder="0,00"
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
              maxLength={9}
              erro={!!erros.valor}
              style={styles.valorInput}
            />
          </View>
        </Campo>

        <Campo titulo="Bairro" erro={erros.bairro}>
          <Input
            placeholder="Ex.: Efapi"
            value={bairro}
            onChangeText={setBairro}
            maxLength={40}
            erro={!!erros.bairro}
          />
          <Button
            title="Usar minha localização"
            variante="secundario"
            onPress={usarLocalizacao}
            carregando={localizando}
            style={styles.botaoLocal}
          />
        </Campo>

        <Campo titulo="Prazo" erro={erros.prazo}>
          <View style={styles.prazos}>
            {PRAZOS.map(p => {
              const ativo = p.dias === prazoDias;
              return (
                <Pressable
                  key={p.dias}
                  onPress={() => setPrazoDias(p.dias)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                  style={[styles.chip, ativo && styles.chipAtivo]}>
                  <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{p.nome}</Text>
                </Pressable>
              );
            })}
          </View>
          {prazoDias !== null && (
            <Label variante="legenda">{`Até ${formatarDataCompleta(dataDaquiA(prazoDias))}`}</Label>
          )}
        </Campo>

        <Button title="Publicar bico" onPress={publicar} carregando={enviando} style={styles.publicar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ titulo, erro, children }: { titulo: string; erro?: string; children: ReactNode }) {
  return (
    <View style={styles.campo}>
      <Label style={styles.campoTitulo}>{titulo}</Label>
      {children}
      {erro && (
        <Label variante="legenda" style={styles.erro}>
          {erro}
        </Label>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, paddingBottom: espacamentos.xl * 2 },
  campo: { marginTop: espacamentos.lg, gap: espacamentos.sm },
  campoTitulo: { fontWeight: '600' },
  erro: { color: cores.perigo },
  contador: { textAlign: 'right' },
  valorLinha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  prefixo: { fontSize: tipografia.subtitulo, fontWeight: '700', color: cores.texto },
  valorInput: { flex: 1 },
  botaoLocal: { minHeight: 44 },
  prazos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.sm },
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
  chipTexto: { fontSize: tipografia.legenda, fontWeight: '600', color: cores.texto },
  chipTextoAtivo: { color: '#FFFFFF' },
  publicar: { marginTop: espacamentos.xl },
});
