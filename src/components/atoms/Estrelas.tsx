import { StyleSheet, Text, View } from 'react-native';

import { cores, tipografia } from '../../theme';

type EstrelasProps = {
  nota: number; // de 0 a 5
  avaliacoes?: number;
};

// Mostra a nota arredondada em estrelas cheias/vazias + o número, ex.: ★★★★☆ 4,3 (12)
export function Estrelas({ nota, avaliacoes }: EstrelasProps) {
  if (avaliacoes === 0) {
    return <Text style={styles.numero}>Novo no PeerGo · sem avaliações</Text>;
  }

  const cheias = Math.round(nota);
  const texto = nota.toFixed(1).replace('.', ',');

  return (
    <View
      style={styles.linha}
      accessible
      accessibilityLabel={`Nota ${texto} de 5${avaliacoes !== undefined ? `, ${avaliacoes} avaliações` : ''}`}>
      <Text style={styles.estrelas}>
        {'★'.repeat(cheias)}
        <Text style={styles.vazias}>{'★'.repeat(5 - cheias)}</Text>
      </Text>
      <Text style={styles.numero}>
        {texto}
        {avaliacoes !== undefined ? ` (${avaliacoes})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  estrelas: { fontSize: tipografia.corpo, color: '#F2A900', letterSpacing: 1 },
  vazias: { color: cores.borda },
  numero: { fontSize: tipografia.legenda, color: cores.textoSecundario },
});
