import {
  obterToken,
  obterUsuario,
  removerToken,
  salvarToken,
  salvarUsuario,
} from './storage';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

// Credenciais fixas, só pra simular o login enquanto não há backend
const EMAIL_VALIDO = 'aluno@unochapeco.edu.br';
const SENHA_VALIDA = '1234';

export async function login(email: string, senha: string): Promise<Usuario> {
  // Simula o tempo de resposta de um servidor
  await new Promise(resolver => setTimeout(resolver, 600));

  if (email.trim().toLowerCase() !== EMAIL_VALIDO || senha !== SENHA_VALIDA) {
    throw new Error('E-mail ou senha inválidos');
  }

  const usuario: Usuario = { id: 1, nome: 'Aluno Teste', email: EMAIL_VALIDO };

  await salvarToken('token-simulado-peergo'); // cofre seguro
  await salvarUsuario(usuario); // AsyncStorage
  return usuario;
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