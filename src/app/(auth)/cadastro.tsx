import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/atoms/Button';
import { Fundo } from '../../components/atoms/Fundo';
import { Input } from '../../components/atoms/Input';
import { Label } from '../../components/atoms/Label';
import { cadastrar, DOMINIO_INSTITUCIONAL, emailInstitucional } from '../../services/auth';
import { cores, espacamentos } from '../../theme';

type Erros = Partial<Record<'nome' | 'curso' | 'email' | 'senha' | 'confirmacao', string>>;

export default function CadastroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function validar(): Erros {
    const e: Erros = {};
    if (nome.trim().split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome.';
    if (curso.trim().length < 3) e.curso = 'Informe seu curso.';
    if (!emailInstitucional(email)) e.email = `Use seu e-mail ${DOMINIO_INSTITUCIONAL}.`;
    if (senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.';
    if (confirmacao !== senha) e.confirmacao = 'As senhas não são iguais.';
    return e;
  }

  async function criarConta() {
    setErroGeral(null);
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setCarregando(true);
    try {
      await cadastrar({ nome, curso, email, senha });
      router.replace('/(tabs)/home');
    } catch (e) {
      setErroGeral(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Fundo>
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.conteudo,
          { paddingTop: insets.top + espacamentos.xl, paddingBottom: insets.bottom + espacamentos.xl },
        ]}
        keyboardShouldPersistTaps="handled">
        <Label variante="titulo" claro>Criar conta</Label>
        <Label variante="legenda" claro style={styles.subtitulo}>
          O PeerGo é só para estudantes. Use seu e-mail institucional.
        </Label>

        <Campo erro={erros.nome}>
          <Input
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            autoComplete="name"
            maxLength={60}
            erro={!!erros.nome}
          />
        </Campo>
        <Campo erro={erros.curso}>
          <Input
            placeholder="Curso (ex.: Direito)"
            value={curso}
            onChangeText={setCurso}
            autoCapitalize="words"
            maxLength={60}
            erro={!!erros.curso}
          />
        </Campo>
        <Campo erro={erros.email}>
          <Input
            placeholder={`seunome${DOMINIO_INSTITUCIONAL}`}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            erro={!!erros.email}
          />
        </Campo>
        <Campo erro={erros.senha}>
          <Input
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoComplete="new-password"
            erro={!!erros.senha}
          />
        </Campo>
        <Campo erro={erros.confirmacao}>
          <Input
            placeholder="Confirme a senha"
            value={confirmacao}
            onChangeText={setConfirmacao}
            secureTextEntry
            autoComplete="new-password"
            erro={!!erros.confirmacao}
          />
        </Campo>

        {erroGeral && (
          <Label variante="legenda" style={styles.erro}>
            {erroGeral}
          </Label>
        )}

        <Button title="Criar conta" onPress={criarConta} carregando={carregando} style={styles.botao} />

        <Pressable onPress={() => router.back()} accessibilityRole="link" style={styles.link} hitSlop={8}>
          <Label variante="legenda" claro>
            Já tem conta? <Label variante="legenda" style={styles.linkDestaque}>Entrar</Label>
          </Label>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
    </Fundo>
  );
}

function Campo({ erro, children }: { erro?: string; children: ReactNode }) {
  return (
    <View style={styles.campo}>
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
  tela: { flex: 1, backgroundColor: 'transparent' },
  conteudo: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: espacamentos.lg },
  subtitulo: { marginBottom: espacamentos.md },
  campo: { marginTop: espacamentos.md, gap: espacamentos.xs },
  erro: { color: '#FFB4A8' },
  botao: { marginTop: espacamentos.lg },
  link: { alignSelf: 'center', marginTop: espacamentos.lg, padding: espacamentos.sm },
  linkDestaque: { color: '#7FE3C4', fontWeight: '600' },
});
