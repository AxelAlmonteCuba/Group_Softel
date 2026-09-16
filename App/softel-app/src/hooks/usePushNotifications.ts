import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { updatePushToken } from '../services/userService';
import { useAuthStore } from '@/store/authStore';

// Importamos solo los tipos para no ejecutar el código real de la librería
import type * as NotificationsType from 'expo-notifications';

// Detectar si estamos en Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof NotificationsType | null = null;

if (!isExpoGo) {
  // Solo cargamos la librería real si NO estamos en Expo Go
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log('Error al cargar expo-notifications', e);
  }
}

// Project ID definido en app.json > extra > eas > projectId
const PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId ?? 'bbb425d4-f905-4a24-a71d-ec69f6838862';

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<NotificationsType.Notification | undefined>();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const token = useAuthStore(state => state.token);

  useEffect(() => {
    // Si no hay token JWT, estamos en Expo Go, o Notifications falló al cargar, abortar.
    if (!token || isExpoGo || !Notifications) {
      if (isExpoGo) {
        console.warn('[PushNotifications] Ignorando registro: Expo Go en SDK 53+ no soporta notificaciones remotas en Android.');
      }
      return;
    }

    // Registramos el dispositivo y enviamos el token al backend
    void registerForPushNotificationsAsync().then(async pushToken => {
      if (pushToken) {
        setExpoPushToken(pushToken);
        try {
          await updatePushToken(pushToken);
          console.log('[PushNotifications] Token registrado en backend:', pushToken);
        } catch (error: any) {
          console.error('[PushNotifications] Error enviando token al backend:', error);
          import('react-native').then(({ Alert }) => {
            Alert.alert('Error Push', 'No se pudo guardar el token en el servidor: ' + error.message);
          });
        }
      }
    });

    // Listener: notificación recibida con la app en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(incoming => {
      setNotification(incoming);
    });

    // Listener: usuario tocó la notificación (background o killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[PushNotifications] El usuario interactuó:', response.notification.request.content.data);
      // TODO: Navegar a la pantalla correspondiente usando el campo `screen` del data payload
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [token]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Notifications) return undefined;

  // Configurar canal de notificaciones en Android 8+
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('softel-default', {
      name: 'Softel Syncrix',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#B42318',
      sound: 'default',
    });
  }

  // Las notificaciones push remotas solo funcionan en dispositivos físicos
  if (!Device.isDevice) {
    import('react-native').then(({ Alert }) => Alert.alert('Aviso Push', 'Requiere dispositivo físico.'));
    return undefined;
  }

  // Pedir permisos al sistema operativo
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    import('react-native').then(({ Alert }) => Alert.alert('Aviso Push', 'Permisos de notificación denegados.'));
    return undefined;
  }

  // Obtener el Expo Push Token usando el projectId de app.json
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    return tokenData.data;
  } catch (error: any) {
    console.error('[PushNotifications] Error al obtener el token:', error);
    import('react-native').then(({ Alert }) => Alert.alert('Error Push Expo', error.message));
    return undefined;
  }
}
