import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

export const requestFCMPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "ios") {
      // Check if device is registered for remote messages first
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
        console.log("📱 iOS device registered for remote messages");
      }

      const authStatus = await messaging().hasPermission();
      console.log(`🍎 iOS current permission status: ${authStatus}`);

      if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
        const requestStatus = await messaging().requestPermission({
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
        });
        console.log(`🍎 iOS permission requested: ${requestStatus}`);
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
      console.log(`🤖 Android notification permission: ${result}`);
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  } catch (error) {
    console.error("❌ FCM permission request failed:", error);
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
        console.log("📱 iOS device registered for remote messages");
      }
      
      // Add a small delay for iOS to ensure APNs registration is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const token = await messaging().getToken();
    console.log("🔑 FCM Token:", token ? `${token.substring(0, 20)}...` : "null");
    return token;
  } catch (error) {
    console.error("❌ FCM token retrieval failed:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

export const setupNotificationListeners = (
  handleNotificationPress: (data: any) => void
) => {
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    console.log("📩 Foreground notification received:", remoteMessage);
    if (remoteMessage?.data) {
      handleNotificationPress(remoteMessage.data);
    }
  });

  const unsubscribeOnOpenedApp = messaging().onNotificationOpenedApp(
    (remoteMessage) => {
      if (remoteMessage?.data) {
        console.log(
          "📲 App opened from background notification:",
          remoteMessage.data
        );
        handleNotificationPress(remoteMessage.data);
      }
    }
  );

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data) {
        console.log(
          "🆕 App opened from quit state via notification:",
          remoteMessage.data
        );
        handleNotificationPress(remoteMessage.data);
      }
    });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnOpenedApp();
  };
};
