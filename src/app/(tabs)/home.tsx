import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../components/atoms/Button';
import { Label } from '../../components/atoms/Label';
import { logout, obterSessao, type Usuario } from '../../services/auth';
import { cores, espacamentos } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    obterSessao().then(setUsuario);
  }, []);

  async function sair() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <Label variante="titulo">Home</Label>
      <Label style={styles.texto}>
        {usuario ? `Olá, ${usuario.nome}!` : 'Carregando...'}
      </Label>
      <Label variante="legenda">{usuario?.email}</Label>

      <Button title="Sair" variante="secundario" onPress={sair} style={styles.botao} />
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
  texto: { marginTop: espacamentos.md },
  botao: { marginTop: espacamentos.xl },
});
