import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Registra el dispositivo para notificaciones push y obtiene el token.
 * Recuerda que en iOS Simulator no funciona, y en Expo Go para iOS puede estar limitado.
 * Lo ideal es usar un dispositivo Android físico o un Development Build con EAS.
 */
export async function registerForPushNotificationsAsync() {
  console.log('>>> [registerForPushNotificationsAsync] Iniciando registro de notificaciones...');
  let token = '';

  // Verificar si estamos en un dispositivo físico (no emulador)
  if (Device.isDevice) {
    console.log('>>> [registerForPushNotificationsAsync] Dispositivo físico detectado.');

    // 1. Comprobar permisos existentes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log(`>>> [registerForPushNotificationsAsync] Permiso actual: ${existingStatus}`);
    let finalStatus = existingStatus;

    // 2. Solicitar permisos si aún no están concedidos
    if (existingStatus !== 'granted') {
      console.log('>>> [registerForPushNotificationsAsync] Solicitando permisos de notificaciones...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log(`>>> [registerForPushNotificationsAsync] Nuevo estado de permiso: ${finalStatus}`);
    }

    // 3. Si el permiso se denegó, no obtendrás token
    if (finalStatus !== 'granted') {
      alert('Permisos de notificaciones denegados');
      console.log('>>> [registerForPushNotificationsAsync] Permiso denegado. Saliendo sin token.');
      return '';
    }

    // 4. Obtener el token de Expo
    console.log('>>> [registerForPushNotificationsAsync] Permiso concedido. Obteniendo token...');
    const expoToken = await Notifications.getExpoPushTokenAsync();
    token = expoToken.data;
    console.log('>>> [registerForPushNotificationsAsync] Token obtenido:', token);
  } else {
    // Emulador / Simulador
    alert('No es un dispositivo físico. No se pueden obtener notificaciones push.');
    console.log('>>> [registerForPushNotificationsAsync] Emulador detectado. Saliendo sin token.');
    return '';
  }

  // 5. Configuración específica de Android (crear un canal de notificación)
  if (Platform.OS === 'android') {
    console.log('>>> [registerForPushNotificationsAsync] Configurando canal en Android...');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    console.log('>>> [registerForPushNotificationsAsync] Canal de notificación configurado con éxito.');
  }

  console.log('>>> [registerForPushNotificationsAsync] Finalizando registro. Retornando token...');
  return token;
}

/**
 * Envía una notificación push al dispositivo que tenga el Expo Push Token especificado.
 *
 * @param expoPushToken - Token de destino
 * @param title - Título de la notificación
 * @param message - Contenido principal de la notificación
 */
export async function sendPushNotification(expoPushToken: string, title: string, message: string) {
  console.log('>>> [sendPushNotification] Iniciando envío de notificación...');
  console.log('>>> [sendPushNotification] Token:', expoPushToken);
  console.log('>>> [sendPushNotification] Título:', title);
  console.log('>>> [sendPushNotification] Mensaje:', message);

  const body = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: message,
    data: { extraData: 'Algún dato extra' },
  };

  try {
    console.log('>>> [sendPushNotification] Realizando POST a la API de Expo...');
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('>>> [sendPushNotification] Error en la respuesta del servidor:', text);
    } else {
      const json = await response.json();
      console.log('>>> [sendPushNotification] Éxito. Respuesta de Expo:', json);
    }
  } catch (error) {
    console.error('>>> [sendPushNotification] Error al enviar la notificación:', error);
  }
  console.log('>>> [sendPushNotification] Finalizando envío de notificación.');
}
