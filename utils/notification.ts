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
    console.error("❌ FCM permission request failed:", error);
    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    // iOS requires explicit device registration for remote notifications
    if (Platform.OS === "ios") {
      console.log("🍎 iOS: Checking device registration...");
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      console.log("🍎 iOS: Device registered for remote messages:", isRegistered);
      
      if (!isRegistered) {
        console.log("🍎 iOS: Registering device for remote messages...");
        await messaging().registerDeviceForRemoteMessages();
        console.log("🍎 iOS: Device registration completed");
      }
      
      // Check authorization status
      const authStatus = await messaging().hasPermission();
      console.log("🍎 iOS: Current authorization status:", authStatus);
      
      // Add a small delay for iOS to ensure APNs registration is complete
      console.log("🍎 iOS: Waiting for APNs registration...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const token = await messaging().getToken();
    console.log("📱 FCM Token retrieved:", token ? "SUCCESS" : "FAILED");
    if (token) {
      console.log("📱 Token preview:", token.substring(0, 20) + "...");
    }
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

// Track handled notifications to prevent duplicates
const handledNotifications = new Set<string>();

export const setupNotificationListeners = (
  handleNotificationPress: (data: any) => void
) => {
  // Helper to prevent duplicate handling
  const handleWithDuplicateCheck = (remoteMessage: any, source: string) => {
    if (remoteMessage?.data) {
      // Create unique key from notification data
      const notificationId = remoteMessage.messageId || remoteMessage.data.match_id || remoteMessage.data.to_id || remoteMessage.data.date_id || JSON.stringify(remoteMessage.data);
      
      console.log(`🔔 Notification received from ${source}:`, notificationId);
      
      // Check if already handled
      if (handledNotifications.has(notificationId)) {
        console.log(`🚫 Duplicate notification ignored (${source}):`, notificationId);
        return;
      }
      
      // Mark as handled
      handledNotifications.add(notificationId);
      
      // Clean up old entries after 5 seconds
      setTimeout(() => {
        handledNotifications.delete(notificationId);
      }, 5000);
      
      console.log(`✅ Processing notification (${source}):`, notificationId);
      handleNotificationPress(remoteMessage.data);
    }
  };

  // 1. Foreground notification handler
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    console.log("📨 onMessage triggered (foreground)");
    handleWithDuplicateCheck(remoteMessage, "foreground");
  });

  // 2. Background tap handler
  const unsubscribeOnOpenedApp = messaging().onNotificationOpenedApp(
    (remoteMessage) => {
      console.log("📨 onNotificationOpenedApp triggered (background tap)");
      handleWithDuplicateCheck(remoteMessage, "background");
    }
  );

  // 3. Initial notification (cold start)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("📨 getInitialNotification triggered (cold start)");
        handleWithDuplicateCheck(remoteMessage, "initial");
      }
    });

  return () => {
    console.log("🧹 Cleaning up notification listeners");
    unsubscribeOnMessage();
    unsubscribeOnOpenedApp();
  };
};
