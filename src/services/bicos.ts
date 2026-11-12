// Serviço de bicos. As telas só conversam com estas funções.
// Hoje os dados são simulados e ficam salvos no aparelho (AsyncStorage);
// quando o backend existir, basta trocar o corpo de cada função por uma
// chamada à API (fetch), mantendo os mesmos nomes e tipos.
import type { Bico, CategoriaId, Conversa, NovoBico, PerfilPublico } from '../types';
import { criarConversa } from './chat';
import { listarContasSimuladas } from './auth';
import { BICOS_MOCK, PERFIS_MOCK } from './mock/dados';
import { obterLocal, salvarLocal } from './storage';

const CHAVE_BICOS = 'mock_bicos';

// Simula o tempo de resposta de um servidor
function esperar(ms = 400) {
  return new Promise(resolver => setTimeout(resolver, ms));
}

async function carregarTodos(): Promise<Bico[]> {
  const salvos = (await obterLocal<Bico[]>(CHAVE_BICOS)) ?? [];
  // Inclui exemplos novos que ainda não estavam salvos neste aparelho
  const faltando = BICOS_MOCK.filter(m => !salvos.some(s => s.id === m.id));
  const todos = [...salvos, ...faltando];
  if (faltando.length > 0 || salvos.length === 0) {
    await salvarLocal(CHAVE_BICOS, todos);
  }
  return todos;
}

type FiltroBicos = {
  categoria?: CategoriaId | null;
};

// Lista os bicos abertos, do mais recente para o mais antigo
export async function listarBicos({ categoria }: FiltroBicos = {}): Promise<Bico[]> {
  await esperar();
  const todos = await carregarTodos();
  return todos
    .filter(b => b.status === 'aberto')
    .filter(b => !categoria || b.categoria === categoria)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

// Serviços concluídos por um prestador, do mais recente para o mais antigo
export async function listarHistorico(prestadorId: number): Promise<Bico[]> {
  await esperar(250);
  const todos = await carregarTodos();
  return todos
    .filter(b => b.status === 'concluido' && b.prestadorId === prestadorId)
    .sort((a, b) => b.prazo.localeCompare(a.prazo));
}

export async function obterBico(id: string): Promise<Bico | null> {
  await esperar(250);
  const todos = await carregarTodos();
  return todos.find(b => b.id === id) ?? null;
}

export async function criarBico(dados: NovoBico, contratanteId: number): Promise<Bico> {
  await esperar();
  const todos = await carregarTodos();
  const novo: Bico = {
    ...dados,
    id: `b${Date.now()}`,
    contratanteId,
    status: 'aberto',
    criadoEm: new Date().toISOString(),
  };
  await salvarLocal(CHAVE_BICOS, [novo, ...todos]);
  return novo;
}

// ---- Interesses ("Tenho Interesse") ----

const CHAVE_INTERESSES = 'mock_interesses';

export type StatusInteresse = 'pendente' | 'aceito' | 'recusado';

export type Interesse = {
  bicoId: string;
  usuarioId: number;
  criadoEm: string;
  status?: StatusInteresse; // interesses antigos não têm status: tratamos como pendente
};

const INTERESSES_MOCK: Interesse[] = [
  { bicoId: 'b1', usuarioId: 1, criadoEm: '2026-11-11T15:00:00.000Z', status: 'aceito' },
  { bicoId: 'b2', usuarioId: 1, criadoEm: '2026-11-12T08:30:00.000Z', status: 'aceito' },
  { bicoId: 'b5', usuarioId: 1, criadoEm: '2026-11-12T11:00:00.000Z', status: 'pendente' },
  { bicoId: 'b7', usuarioId: 3, criadoEm: '2026-11-10T12:00:00.000Z', status: 'pendente' },
  { bicoId: 'b7', usuarioId: 4, criadoEm: '2026-11-11T09:00:00.000Z', status: 'pendente' },
];

async function carregarInteresses(): Promise<Interesse[]> {
  const salvos = await obterLocal<Interesse[]>(CHAVE_INTERESSES);
  if (salvos) return salvos;
  await salvarLocal(CHAVE_INTERESSES, INTERESSES_MOCK);
  return INTERESSES_MOCK;
}

export async function jaTemInteresse(bicoId: string, usuarioId: number): Promise<boolean> {
  const interesses = await carregarInteresses();
  return interesses.some(i => i.bicoId === bicoId && i.usuarioId === usuarioId);
}

export async function manifestarInteresse(bicoId: string, usuarioId: number): Promise<void> {
  await esperar();
  const bico = await obterBico(bicoId);
  if (!bico) throw new Error('Este bico não existe mais.');
  if (bico.status !== 'aberto') throw new Error('Este bico não está mais disponível.');
  if (bico.contratanteId === usuarioId) throw new Error('Você não pode se candidatar ao próprio bico.');

  const interesses = await carregarInteresses();
  if (interesses.some(i => i.bicoId === bicoId && i.usuarioId === usuarioId)) return;

  await salvarLocal(CHAVE_INTERESSES, [
    ...interesses,
    { bicoId, usuarioId, criadoEm: new Date().toISOString(), status: 'pendente' },
  ]);
}

// Quem demonstrou interesse num bico, do primeiro para o último
export async function listarInteressados(bicoId: string): Promise<Interesse[]> {
  const todos = await carregarInteresses();
  return todos
    .filter(i => i.bicoId === bicoId)
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
}

// O contratante aceita um interessado: o bico vai para "em andamento",
// os outros interessados são recusados e a conversa é criada
export async function aceitarInteresse(bicoId: string, usuarioId: number, contratanteId: number): Promise<Conversa> {
  await esperar();
  const bico = await obterBico(bicoId);
  if (!bico) throw new Error('Este bico não existe mais.');
  if (bico.contratanteId !== contratanteId) throw new Error('Só quem publicou o bico pode aceitar interessados.');
  if (bico.status !== 'aberto') throw new Error('Este bico já tem um prestador definido.');

  const interesses = await carregarInteresses();
  if (!interesses.some(i => i.bicoId === bicoId && i.usuarioId === usuarioId)) {
    throw new Error('Esta pessoa não demonstrou interesse neste bico.');
  }

  const atualizados = interesses.map((i): Interesse => {
    if (i.bicoId !== bicoId) return i;
    const status: StatusInteresse = i.usuarioId === usuarioId ? 'aceito' : 'recusado';
    return { ...i, status };
  });
  await salvarLocal(CHAVE_INTERESSES, atualizados);

  const todosBicos = await carregarTodos();
  await salvarLocal(
    CHAVE_BICOS,
    todosBicos.map(b => (b.id === bicoId ? { ...b, status: 'em_andamento', prestadorId: usuarioId } : b)),
  );

  return criarConversa(bicoId, contratanteId, usuarioId);
}

export async function contarInteressados(bicoId: string): Promise<number> {
  const interesses = await carregarInteresses();
  return interesses.filter(i => i.bicoId === bicoId).length;
}

export async function obterPerfil(id: number): Promise<PerfilPublico | null> {
  await esperar(250);
  const exemplo = PERFIS_MOCK.find(p => p.id === id);
  if (exemplo) return exemplo;

  // Conta criada pela tela de cadastro: ainda sem avaliações
  const conta = (await listarContasSimuladas()).find(c => c.id === id);
  if (!conta) return null;
  return {
    id: conta.id,
    nome: conta.nome,
    curso: conta.curso ?? '',
    nota: 0,
    avaliacoes: 0,
    servicosPrestados: 0,
  };
}
