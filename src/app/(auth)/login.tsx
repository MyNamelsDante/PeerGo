import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Label } from '../../components/atoms/Label';
import { login } from '../../services/auth';
import { cores, espacamentos } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
      router.replace('/(tabs)/home');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Label variante="titulo">PeerGo</Label>
      <Label variante="legenda" style={styles.subtitulo}>
        Entre com seu e-mail institucional
      </Label>

      <Input
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        erro={!!erro}
      />
      <Input
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        erro={!!erro}
        style={styles.campo}
      />

      {erro && (
        <Label variante="legenda" style={styles.erro}>
          {erro}
        </Label>
      )}

      <Button title="Entrar" onPress={entrar} carregando={carregando} style={styles.botao} />

      <Pressable
        onPress={() => router.push('/(auth)/cadastro')}
        accessibilityRole="link"
        style={styles.link}
        hitSlop={8}>
        <Label variante="legenda">
          Ainda não tem conta? <Label variante="legenda" style={styles.linkDestaque}>Cadastre-se</Label>
        </Label>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: espacamentos.lg,
    backgroundColor: cores.fundo,
  },
  subtitulo: { marginBottom: espacamentos.lg },
  campo: { marginTop: espacamentos.md },
  erro: { color: cores.perigo, marginTop: espacamentos.sm },
  botao: { marginTop: espacamentos.lg },
  link: { alignSelf: 'center', marginTop: espacamentos.lg, padding: espacamentos.sm },
  linkDestaque: { color: cores.primaria, fontWeight: '600' },
});
