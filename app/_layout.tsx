import { AppProvider } from "@/context/app_context";
import { color } from "@/utils/constants";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { ToastProvider } from "../components/toast_provider";
import i18n from "../utils/i18n";

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
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>
        <ToastProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <Stack
            screenOptions={{ headerShown: false, animation: "default" }}
            initialRouteName="index"
          />
        </ToastProvider>
      </AppProvider>
    </I18nextProvider>
  );
}
