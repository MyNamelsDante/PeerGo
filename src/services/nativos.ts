import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Cada permissão pode estar: 'granted' (liberada), 'denied' (negada)
// ou 'undetermined' (o app ainda não perguntou)
export type StatusPermissoes = {
  camera: string;
  galeria: string;
  localizacao: string;
  notificacoes: string;
};

export async function statusPermissoes(): Promise<StatusPermissoes> {
  const [cam, gal, loc, notif] = await Promise.all([
    ImagePicker.getCameraPermissionsAsync(),
    ImagePicker.getMediaLibraryPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    Notifications.getPermissionsAsync(),
  ]);

  return {
    camera: cam.status,
    galeria: gal.status,
    localizacao: loc.status,
    notificacoes: notif.status,
  };
}


export type FotoCapturada = { uri: string };

export async function capturarFoto(): Promise<FotoCapturada | null> {
  // Mostra a janelinha do Android perguntando se o app pode usar a câmera
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão da câmera negada.');
  }

  const resultado = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.6,
    allowsEditing: true,
    aspect: [1, 1],
  });

  // Se a pessoa fechar a câmera sem tirar a foto
  if (resultado.canceled) {
    return null;
  }

  return { uri: resultado.assets[0].uri };
}


export async function escolherImagem(): Promise<FotoCapturada | null> {
  // Mostra a janelinha do Android perguntando se o app pode acessar as fotos
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão da galeria negada.');
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.6,
    allowsEditing: true,
    aspect: [1, 1],
  });

  // Se a pessoa fechar a galeria sem escolher nada
  if (resultado.canceled) {
    return null;
  }

  return { uri: resultado.assets[0].uri };
}


export type Posicao = {
  latitude: number;
  longitude: number;
  precisao: number | null;
};

export async function obterPosicao(): Promise<Posicao> {
  // Mostra a janelinha do Android perguntando se o app pode usar a localização
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de localização negada.');
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    precisao: pos.coords.accuracy,
  };
}


let handlerPronto = false;

// Define como a notificação aparece quando o app está aberto
export function configurarNotificacoes(): void {
  if (handlerPronto) {
    return;
  }
  handlerPronto = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function pedirPermissaoNotificacao(): Promise<boolean> {
  configurarNotificacoes();

  // No Android, toda notificação precisa de um "canal"
  await Notifications.setNotificationChannelAsync('peergo', {
    name: 'PeerGo',
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  const atual = await Notifications.getPermissionsAsync();
  let status = atual.status;

  if (status !== 'granted') {
    const pedido = await Notifications.requestPermissionsAsync();
    status = pedido.status;
  }

  return status === 'granted';
}


type AvisoLocal = {
  titulo: string;
  corpo: string;
};

export async function enviarAvisoLocal({ titulo, corpo }: AvisoLocal): Promise<void> {
  const liberado = await pedirPermissaoNotificacao();
  if (!liberado) {
    throw new Error('Permissão de notificação negada.');
  }

  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}