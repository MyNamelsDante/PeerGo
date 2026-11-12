import {
  obterLocal,
  obterToken,
  obterUsuario,
  removerToken,
  salvarLocal,
  salvarToken,
  salvarUsuario,
} from './storage';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  curso?: string;
};

export const DOMINIO_INSTITUCIONAL = '@unochapeco.edu.br';

export function emailInstitucional(email: string): boolean {
  const limpo = email.trim().toLowerCase();
  return limpo.endsWith(DOMINIO_INSTITUCIONAL) && limpo.length > DOMINIO_INSTITUCIONAL.length;
}

// ---------------------------------------------------------------------------
// SIMULAÇÃO: enquanto não há backend, as contas ficam salvas no próprio
// aparelho. A senha NÃO deve ser guardada assim num app de verdade; quem
// confere a senha é o servidor. Quando a API existir, troque o corpo de
// login() e cadastrar() por chamadas a ela e apague esta parte.
// ---------------------------------------------------------------------------
type ContaSimulada = Usuario & { senha: string };

const CHAVE_CONTAS = 'mock_contas';

const CONTA_TESTE: ContaSimulada = {
  id: 1,
  nome: 'Aluno Teste',
  email: 'aluno@unochapeco.edu.br',
  curso: 'Ciência da Computação',
  senha: '1234',
};

async function carregarContas(): Promise<ContaSimulada[]> {
  return (await obterLocal<ContaSimulada[]>(CHAVE_CONTAS)) ?? [CONTA_TESTE];
}

// Usado pelo serviço de bicos para montar o perfil público de quem se cadastrou
export async function listarContasSimuladas(): Promise<Usuario[]> {
  const contas = await carregarContas();
  return contas.map(({ senha: _senha, ...usuario }) => usuario);
}

function esperar(ms = 600) {
  return new Promise(resolver => setTimeout(resolver, ms));
}

async function iniciarSessao(conta: ContaSimulada): Promise<Usuario> {
  const { senha: _senha, ...usuario } = conta;
  await salvarToken(`token-simulado-${usuario.id}`); // cofre seguro
  await salvarUsuario(usuario); // AsyncStorage
  return usuario;
}

export async function login(email: string, senha: string): Promise<Usuario> {
  await esperar();

  if (!emailInstitucional(email)) {
    throw new Error(`Use seu e-mail institucional (${DOMINIO_INSTITUCIONAL}).`);
  }

  const contas = await carregarContas();
  const conta = contas.find(c => c.email === email.trim().toLowerCase());
  if (!conta || conta.senha !== senha) {
    throw new Error('E-mail ou senha inválidos');
  }

  return iniciarSessao(conta);
}

type DadosCadastro = {
  nome: string;
  curso: string;
  email: string;
  senha: string;
};

export async function cadastrar({ nome, curso, email, senha }: DadosCadastro): Promise<Usuario> {
  await esperar();

  const emailLimpo = email.trim().toLowerCase();
  if (!emailInstitucional(emailLimpo)) {
    throw new Error(`O cadastro é só para e-mails ${DOMINIO_INSTITUCIONAL}.`);
  }

  const contas = await carregarContas();
  if (contas.some(c => c.email === emailLimpo)) {
    throw new Error('Já existe uma conta com este e-mail.');
  }

  // Começa em 100 para não colidir com os perfis de exemplo
  const proximoId = Math.max(99, ...contas.map(c => c.id)) + 1;
  const conta: ContaSimulada = {
    id: proximoId,
    nome: nome.trim(),
    curso: curso.trim(),
    email: emailLimpo,
    senha,
  };

  await salvarLocal(CHAVE_CONTAS, [...contas, conta]);
  return iniciarSessao(conta);
}

export async function sessaoAtiva(): Promise<boolean> {
  return (await obterToken()) !== null;
}

export async function obterSessao(): Promise<Usuario | null> {
  if (!(await sessaoAtiva())) return null;
  return obterUsuario<Usuario>();
}

export async function logout(): Promise<void> {
  await removerToken();
}
