export type CategoriaId =
  | 'academico'
  | 'pets'
  | 'tecnologia'
  | 'design'
  | 'entregas'
  | 'outros';

export type StatusBico = 'aberto' | 'em_andamento' | 'concluido';

export type Bico = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaId;
  valor: number; // em reais
  bairro: string;
  prazo: string; // data ISO (AAAA-MM-DD)
  contratanteId: number;
  status: StatusBico;
  criadoEm: string; // data ISO
  prestadorId?: number; // quem fez o serviço (só em bicos concluídos)
  avaliacao?: number; // nota de 0 a 5 dada pelo contratante
};

// Dados que o formulário "Criar bico" envia; o resto é preenchido pelo serviço
export type NovoBico = Pick<Bico, 'titulo' | 'descricao' | 'categoria' | 'valor' | 'bairro' | 'prazo'>;

// Perfil público de um estudante (o que outros usuários podem ver)
export type PerfilPublico = {
  id: number;
  nome: string;
  curso: string;
  nota: number; // média de estrelas, de 0 a 5
  avaliacoes: number;
  servicosPrestados: number;
};

export type Mensagem = {
  id: string;
  autorId: number;
  texto: string;
  enviadaEm: string; // data ISO
};

// Conversa entre contratante e prestador de um bico
export type Conversa = {
  id: string;
  bicoId: string;
  participantes: [number, number]; // [contratante, prestador]
  mensagens: Mensagem[];
};
