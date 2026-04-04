/**
 * Custom entry: register FCM background handler before Expo Router boots.
 * Required for app icon badge when a push arrives while the app is backgrounded.
 */
const messaging = require("@react-native-firebase/messaging").default;
const Notifications = require("expo-notifications");

messaging().setBackgroundMessageHandler(async () => {
  try {
    const current = await Notifications.getBadgeCountAsync();
    await Notifications.setBadgeCountAsync(current + 1);
  } catch {
    // ignore
  }
});

require("expo-router/entry");
