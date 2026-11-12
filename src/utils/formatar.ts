// R$ 1.234,50
export function formatarMoeda(valor: number): string {
  const [inteiro, centavos] = valor.toFixed(2).split('.');
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${comMilhar},${centavos}`;
}

// "2026-11-20" -> "20/11"
export function formatarData(iso: string): string {
  const [, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}`;
}

// "2026-11-20" -> "20/11/2026"
export function formatarDataCompleta(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}
