// Serviço de conversas. Mesmo esquema do serviço de bicos: hoje os dados
// ficam no aparelho (AsyncStorage); quando o backend existir, troque o corpo
// das funções por chamadas à API, mantendo nomes e tipos.
import type { Conversa, Mensagem } from '../types';
import { obterLocal, salvarLocal } from './storage';

const CHAVE_CONVERSAS = 'mock_conversas';
const TAMANHO_MAXIMO_MENSAGEM = 500;

// Conversas de exemplo: a 1 (Aluno Teste) com a Mariana e a 2 com a Ana
const CONVERSAS_MOCK: Conversa[] = [
  {
    id: 'c1',
    bicoId: 'b1',
    participantes: [2, 1],
    mensagens: [
      {
        id: 'm1',
        autorId: 2,
        texto: 'Oi! Vi que você se interessou pelo TCC. Quando consegue começar?',
        enviadaEm: '2026-11-11T15:00:00.000Z',
      },
      {
        id: 'm2',
        autorId: 1,
        texto: 'Oi, Mariana! Consigo começar amanhã à tarde.',
        enviadaEm: '2026-11-11T15:05:00.000Z',
      },
    ],
  },
  {
    id: 'c2',
    bicoId: 'b2',
    participantes: [4, 1],
    mensagens: [
      {
        id: 'm3',
        autorId: 4,
        texto: 'Oi! A Mel é bem tranquila. Pode buscar ela às 8h?',
        enviadaEm: '2026-11-12T09:00:00.000Z',
      },
    ],
  },
];

async function carregarTodas(): Promise<Conversa[]> {
  const salvas = await obterLocal<Conversa[]>(CHAVE_CONVERSAS);
  if (salvas) return salvas;
  await salvarLocal(CHAVE_CONVERSAS, CONVERSAS_MOCK);
  return CONVERSAS_MOCK;
}

export function outroParticipante(conversa: Conversa, usuarioId: number): number {
  return conversa.participantes.find(p => p !== usuarioId) ?? usuarioId;
}

// Conversas do usuário, com as mais recentes primeiro
export async function listarConversas(usuarioId: number): Promise<Conversa[]> {
  const todas = await carregarTodas();
  const ultimaData = (c: Conversa) => c.mensagens[c.mensagens.length - 1]?.enviadaEm ?? '';
  return todas
    .filter(c => c.participantes.includes(usuarioId))
    .sort((a, b) => ultimaData(b).localeCompare(ultimaData(a)));
}

// Cria a conversa quando o contratante aceita um interessado.
// Se já existir uma conversa desse bico com essa pessoa, devolve a existente.
export async function criarConversa(bicoId: string, contratanteId: number, prestadorId: number): Promise<Conversa> {
  const todas = await carregarTodas();
  const existente = todas.find(c => c.bicoId === bicoId && c.participantes.includes(prestadorId));
  if (existente) return existente;

  const nova: Conversa = {
    id: `c${Date.now()}`,
    bicoId,
    participantes: [contratanteId, prestadorId],
    mensagens: [],
  };
  await salvarLocal(CHAVE_CONVERSAS, [nova, ...todas]);
  return nova;
}

export async function obterConversa(id: string): Promise<Conversa | null> {
  const todas = await carregarTodas();
  return todas.find(c => c.id === id) ?? null;
}

export async function enviarMensagem(conversaId: string, autorId: number, texto: string): Promise<Mensagem> {
  const limpo = texto.trim();
  if (!limpo) throw new Error('Escreva uma mensagem.');
  if (limpo.length > TAMANHO_MAXIMO_MENSAGEM) {
    throw new Error(`A mensagem pode ter no máximo ${TAMANHO_MAXIMO_MENSAGEM} caracteres.`);
  }

  const todas = await carregarTodas();
  const conversa = todas.find(c => c.id === conversaId);
  if (!conversa) throw new Error('Conversa não encontrada.');
  if (!conversa.participantes.includes(autorId)) throw new Error('Você não participa desta conversa.');

  const mensagem: Mensagem = {
    id: `m${Date.now()}`,
    autorId,
    texto: limpo,
    enviadaEm: new Date().toISOString(),
  };
  conversa.mensagens = [...conversa.mensagens, mensagem];
  await salvarLocal(CHAVE_CONVERSAS, todas);
  return mensagem;
}
