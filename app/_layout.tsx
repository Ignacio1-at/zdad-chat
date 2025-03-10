import { Slot } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';
import { Alert, Platform, Text, View } from 'react-native';
import { PushTokenProvider, usePushToken } from '../context/PushTokenContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <PushTokenProvider>
      <RootLayoutWithNotifications />
    </PushTokenProvider>
  );
}

function RootLayoutWithNotifications() {
  console.log('>>> [RootLayout] Componente montado!');
  const { expoPushToken, setExpoPushToken } = usePushToken();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  useEffect(() => {
    console.log('>>> [RootLayout] useEffect - Registrando notificaciones push...');
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          console.log('>>> [RootLayout] Token obtenido:', token);
          setExpoPushToken(token); // << Guardamos en el contexto
        } else {
          console.warn('>>> [RootLayout] No se obtuvo ningún token.');
        }
      })
      .catch((err) => {
        console.error('>>> [RootLayout] Error en registerForPushNotificationsAsync:', err);
      });
    
    // Listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('>>> [RootLayout] Notificación en primer plano:', notification);
      });
    
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('>>> [RootLayout] Usuario tocó la notificación:', response);
        const data = response.notification.request.content.data;
        Alert.alert('Tocaste la notificación!', JSON.stringify(data));
      });
    
    return () => {
      console.log('>>> [RootLayout] Limpiando listeners de notificaciones...');
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Ahora solo retorna el Slot sin mostrar el token
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
