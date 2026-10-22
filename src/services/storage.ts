import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const CHAVE_TOKEN = 'auth_token';
const CHAVE_USUARIO = 'auth_usuario';

const opcoesSeguras: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// Gaveta 1: cofre seguro (só o token de login)
export async function salvarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token, opcoesSeguras);
}

export async function obterToken(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

export async function removerToken(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
  await AsyncStorage.removeItem(CHAVE_USUARIO);
}

// Gaveta 2: AsyncStorage (dados que não são segredo)
export async function salvarUsuario(usuario: unknown): Promise<void> {
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export async function obterUsuario<T = unknown>(): Promise<T | null> {
  return obterLocal<T>(CHAVE_USUARIO);
}

export async function salvarLocal(chave: string, valor: unknown): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function obterLocal<T = unknown>(chave: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(chave);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function removerLocal(chave: string): Promise<void> {
  await AsyncStorage.removeItem(chave);
}