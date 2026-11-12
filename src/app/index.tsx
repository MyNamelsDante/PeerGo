import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { sessaoAtiva } from '../services/auth';

// Mantém a splash na tela enquanto verificamos se já existe sessão salva
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const [logado, setLogado] = useState<boolean | null>(null);

  useEffect(() => {
    sessaoAtiva()
      .catch(() => false)
      .then(setLogado)
      .finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, []);

  if (logado === null) return null; // a splash continua visível

  return <Redirect href={logado ? '/(tabs)/home' : '/(auth)/login'} />;
}
