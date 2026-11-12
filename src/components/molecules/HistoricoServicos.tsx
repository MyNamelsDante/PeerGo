import { StyleSheet, View } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '../../theme';
import { obterCategoria } from '../../constants/categorias';
import type { Bico } from '../../types';
import { formatarDataCompleta, formatarMoeda } from '../../utils/formatar';
import { Estrelas } from '../atoms/Estrelas';
import { Label } from '../atoms/Label';

type HistoricoServicosProps = {
  bicos: Bico[];
};

// Lista dos serviços concluídos, com valor e a avaliação que o contratante deu
export function HistoricoServicos({ bicos }: HistoricoServicosProps) {
  if (bicos.length === 0) {
    return <Label variante="legenda">Nenhum serviço concluído ainda.</Label>;
  }

  return (
    <View style={styles.lista}>
      {bicos.map(bico => (
        <View key={bico.id} style={styles.item}>
          <View style={styles.topo}>
            <Label style={styles.titulo}>{bico.titulo}</Label>
            <Label style={styles.valor}>{formatarMoeda(bico.valor)}</Label>
          </View>
          <Label variante="legenda">
            {`${obterCategoria(bico.categoria).nome} · prazo ${formatarDataCompleta(bico.prazo)}`}
          </Label>
          {bico.avaliacao !== undefined ? (
            <Estrelas nota={bico.avaliacao} />
          ) : (
            <Label variante="legenda">Sem avaliação</Label>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: espacamentos.sm },
  item: {
    padding: espacamentos.md,
    gap: espacamentos.xs,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espacamentos.sm },
  titulo: { flex: 1, fontSize: tipografia.corpo, fontWeight: '600' },
  valor: { fontWeight: '700', color: cores.sucesso },
});
