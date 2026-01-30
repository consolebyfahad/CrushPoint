import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

export const requestFCMPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "ios") {
      // Check if device is registered for remote messages first
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
    // iOS requires explicit device registration for remote notifications
    if (Platform.OS === "ios") {

      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;

      if (!isRegistered) {

        await messaging().registerDeviceForRemoteMessages();

      }

      // Check authorization status
      const authStatus = await messaging().hasPermission();

      // Add a small delay for iOS to ensure APNs registration is complete

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const token = await messaging().getToken();

    return token;
  } catch (error) {
    return null;
  }
};

// Track handled notifications to prevent duplicates
const handledNotifications = new Set<string>();

export const setupNotificationListeners = (
  handleNotificationPress: (data: any, notificationBody?: string) => void
) => {
  // Helper to prevent duplicate handling
  const handleWithDuplicateCheck = (remoteMessage: any, source: string) => {
    if (remoteMessage?.data) {
      // Create unique key from notification data
      const notificationId = remoteMessage.messageId || remoteMessage.data.match_id || remoteMessage.data.to_id || remoteMessage.data.date_id || JSON.stringify(remoteMessage.data);

      // Check if already handled
      if (handledNotifications.has(notificationId)) {
        return;
      }

      // Mark as handled
      handledNotifications.add(notificationId);

      // Clean up old entries after 5 seconds
      setTimeout(() => {
        handledNotifications.delete(notificationId);
      }, 5000);
      // Pass notification body to help identify message vs match notifications
      const notificationBody = remoteMessage?.notification?.body || "";
      handleNotificationPress(remoteMessage.data, notificationBody);
    }
  };

  // 1. Foreground notification handler
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    handleWithDuplicateCheck(remoteMessage, "foreground");
  });

  // 2. Background tap handler
  const unsubscribeOnOpenedApp = messaging().onNotificationOpenedApp(
    (remoteMessage) => {
      handleWithDuplicateCheck(remoteMessage, "background");
    }
  );

  // 3. Initial notification (cold start)
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
