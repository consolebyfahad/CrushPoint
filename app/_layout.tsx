import { AppProvider } from "@/context/app_context";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { StatusBar } from "react-native";
import { ToastProvider } from "../components/toast_provider";
import i18n from "../utils/i18n";

// Hide the default native splash immediately so only the in-app splash (index) is shown
SplashScreen.hideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter_24pt-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_24pt-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_24pt-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_24pt-Bold.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter_24pt-ExtraBold.ttf"),
  });

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (fontsLoaded || fontError) {
      setIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  if (!isReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>
        <ToastProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "default",
              gestureEnabled: false,
            }}
            initialRouteName="index"
          />
        </ToastProvider>
      </AppProvider>
    </I18nextProvider>
  );
}
