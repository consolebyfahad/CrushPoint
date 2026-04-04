import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

import { bumpAppIconBadge } from "./appBadge";

export const requestFCMPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "ios") {
      
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
      }

      const authStatus = await messaging().hasPermission();

      if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
        const requestStatus = await messaging().requestPermission({
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
        });
        return (
          requestStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          requestStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }

      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }

    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  } catch (error) {

    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    
    if (Platform.OS === "ios") {

      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;

      if (!isRegistered) {

        await messaging().registerDeviceForRemoteMessages();

      }

      const authStatus = await messaging().hasPermission();

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const token = await messaging().getToken();

    return token;
  } catch (error) {
    return null;
  }
};

const handledNotifications = new Set<string>();

export const setupNotificationListeners = (
  handleNotificationPress: (data: any, notificationBody?: string) => void
) => {
  
  const handleWithDuplicateCheck = (remoteMessage: any, source: string) => {
    if (remoteMessage?.data) {
      const notificationId =
        remoteMessage.messageId ||
        remoteMessage.data.match_id ||
        remoteMessage.data.to_id ||
        remoteMessage.data.date_id ||
        JSON.stringify(remoteMessage.data);

      if (handledNotifications.has(notificationId)) {
        return;
      }

      handledNotifications.add(notificationId);

      setTimeout(() => {
        handledNotifications.delete(notificationId);
      }, 5000);

      void bumpAppIconBadge();

      const notificationBody = remoteMessage?.notification?.body || "";
      handleNotificationPress(remoteMessage.data, notificationBody);
      return;
    }

    if (remoteMessage?.notification) {
      const id = remoteMessage.messageId || remoteMessage.notification.title;
      if (id && handledNotifications.has(id)) return;
      if (id) {
        handledNotifications.add(id);
        setTimeout(() => handledNotifications.delete(id), 5000);
      }
      void bumpAppIconBadge();
    }
  };

  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    handleWithDuplicateCheck(remoteMessage, "foreground");
  });

  const unsubscribeOnOpenedApp = messaging().onNotificationOpenedApp(
    (remoteMessage) => {
      handleWithDuplicateCheck(remoteMessage, "background");
    }
  );

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        handleWithDuplicateCheck(remoteMessage, "initial");
      }
    });

  return () => {

    unsubscribeOnMessage();
    unsubscribeOnOpenedApp();
  };
};
