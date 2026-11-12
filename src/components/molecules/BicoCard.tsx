import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { obterCategoria } from '../../constants/categorias';
import { cores, espacamentos, raios, tipografia } from '../../theme';
import type { Bico } from '../../types';
import { formatarData, formatarMoeda } from '../../utils/formatar';

type BicoCardProps = {
  bico: Bico;
  onPress: () => void;
};

export function BicoCard({ bico, onPress }: BicoCardProps) {
  const categoria = obterCategoria(bico.categoria);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${bico.titulo}, ${categoria.nome}, ${bico.bairro}, ${formatarMoeda(bico.valor)}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressionado]}>
      <View style={styles.topo}>
        <View style={[styles.selo, { backgroundColor: categoria.cor }]}>
          <Text style={styles.seloTexto}>{categoria.nome}</Text>
        </View>
        <Text style={styles.valor}>{formatarMoeda(bico.valor)}</Text>
      </View>

      <Text style={styles.titulo} numberOfLines={2}>
        {bico.titulo}
      </Text>

      <View style={styles.rodape}>
        <View style={styles.info}>
          <SymbolView
            name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
            tintColor={cores.textoSecundario}
            size={16}
          />
          <Text style={styles.infoTexto}>{bico.bairro}</Text>
        </View>
        <View style={styles.info}>
          <SymbolView
            name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
            tintColor={cores.textoSecundario}
            size={16}
          />
          <Text style={styles.infoTexto}>até {formatarData(bico.prazo)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    gap: espacamentos.sm,
  },
  pressionado: { opacity: 0.85 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selo: {
    paddingHorizontal: espacamentos.sm,
    paddingVertical: espacamentos.xs,
    borderRadius: raios.sm,
  },
  seloTexto: { fontSize: tipografia.legenda, fontWeight: '600', color: cores.texto },
  valor: { fontSize: tipografia.subtitulo, fontWeight: '700', color: cores.sucesso },
  titulo: { fontSize: tipografia.corpo, fontWeight: '600', color: cores.texto },
  rodape: { flexDirection: 'row', gap: espacamentos.md },
  info: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.xs },
  infoTexto: { fontSize: tipografia.legenda, color: cores.textoSecundario },
});
