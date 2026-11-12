import { Image, StyleSheet, Text, View } from 'react-native';

import { cores, espacamentos, tipografia } from '../../theme';
import { Estrelas } from '../atoms/Estrelas';
import { Label } from '../atoms/Label';

type CabecalhoPerfilProps = {
  nome: string;
  curso: string;
  nota: number;
  avaliacoes: number;
  servicosPrestados: number;
  fotoUri?: string | null;
};

// Foto (ou inicial do nome), nome, curso, estrelas e total de serviços
export function CabecalhoPerfil({
  nome,
  curso,
  nota,
  avaliacoes,
  servicosPrestados,
  fotoUri,
}: CabecalhoPerfilProps) {
  return (
    <View style={styles.bloco}>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.foto} accessibilityLabel="Foto do perfil" />
      ) : (
        <View style={[styles.foto, styles.semFoto]}>
          <Text style={styles.inicial}>{nome.charAt(0)}</Text>
        </View>
      )}

      <Label variante="subtitulo" style={styles.centro}>
        {nome}
      </Label>
      {curso ? <Label variante="legenda">{curso}</Label> : null}
      <Estrelas nota={nota} avaliacoes={avaliacoes} />
      <Label variante="legenda">
        {`${servicosPrestados} ${servicosPrestados === 1 ? 'serviço prestado' : 'serviços prestados'}`}
      </Label>
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: {
    alignItems: 'center',
    gap: espacamentos.sm,
    paddingVertical: espacamentos.lg,
    paddingHorizontal: espacamentos.lg,
    backgroundColor: cores.superficie,
    borderRadius: 20,
  },
  foto: { width: 112, height: 112, borderRadius: 56, marginBottom: espacamentos.sm },
  semFoto: { backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  inicial: { color: '#FFFFFF', fontSize: 44, fontWeight: '700' },
  centro: { textAlign: 'center', fontSize: tipografia.subtitulo },
});
