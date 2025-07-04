import CustomButton from "@/components/custom_button";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { AnimatedLogo } from "@/utils//animations";
import { apiCall } from "@/utils/api";
import { requestFullCameraAccess } from "@/utils/camera";
import { color, font } from "@/utils/constants";
import {
  getFCMToken,
  requestFCMPermission,
  setupNotificationListeners,
} from "@/utils/notification";
import { AppleIcon, EmailIcon, GoogleIcon, PhoneIcon } from "@/utils/SvgIcons";
import * as Device from "expo-device";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const { setUser, user } = useAppContext();
  const { showToast } = useToast();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const getDeviceInfo = async () => {
    try {
      return {
        platform: Platform.OS || "",
        model: Device.modelName || "unknown",
      };
    } catch (error) {
      console.error("Error getting device info:", error);
      return {
        platform: Platform.OS || "",
        model: "unknown",
      };
    }
  };

  const requestPermissionsSequentially = async () => {
    try {
      await requestNotificationPermissions();
      await requestCameraPermissions();
    } catch (error) {
      console.error("Error in permission flow:", error);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      console.log("🔔 Requesting notification permissions...");
      const permissionGranted = await requestFCMPermission();

      if (permissionGranted) {
        console.log("✅ Notification permission granted");
        await registerFCMToken();
      } else {
        console.log("❌ Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
    }
  };

  const registerFCMToken = async () => {
    try {
      const token = await getFCMToken();
      if (!token || !user?.user_id) return;

      const deviceInfo = await getDeviceInfo();
      const formData = new FormData();
      formData.append("type", "update_noti");
      formData.append("user_id", user.user_id);
      formData.append("devicePlatform", deviceInfo.platform);
      formData.append("deviceRid", token);
      formData.append("deviceModel", deviceInfo.model);

      const response = await apiCall(formData);
      console.log("✅ FCM token registered:", response.success);
    } catch (error) {
      console.error("❌ FCM registration failed:", error);
    }
  };

  const requestCameraPermissions = async () => {
    try {
      const cameraPermissions = await requestFullCameraAccess();

      if (cameraPermissions.camera && cameraPermissions.mediaLibrary) {
      } else {
        console.log("❌ Some camera permissions denied:", cameraPermissions);
      }
    } catch (error) {
      console.error("Error requesting camera permissions:", error);
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const handleNotificationPress = (data: any) => {
      console.log("🔔 Notification Pressed:", data);
    };
    const unsubscribe = setupNotificationListeners(handleNotificationPress);

    requestPermissionsSequentially();

    return () => {
      unsubscribe();
    };
  }, [user?.user_id]);

  const handleSocialLogin = async (provider: "apple" | "google") => {
    const setLoading =
      provider === "apple" ? setAppleLoading : setGoogleLoading;
    const token = provider === "apple" ? "1" : "2";

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("token", token);

      const response = await apiCall(formData);

      if (response.success) {
        const userData = {
          user_id: response.user_id,
          email: response.email,
          name: response.name,
          image: response.image,
          created: response.created,
        };

        setUser(userData);

        router.push({
          pathname: "/auth/verify",
          params: {
            type: `${provider} account`,
            contact: `${provider} account`,
          },
        });
      } else {
        showToast(response.message || "Login failed", "error");
        console.error("Login Error:", response.message);
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = () => handleSocialLogin("apple");
  const handleGoogleSignUp = () => handleSocialLogin("google");

  const handlePhoneSignUp = () => {
    router.push({
      pathname: "/auth/login",
      params: { tab: "phone" },
    });
  };

  const handleEmailSignUp = () => {
    router.push({
      pathname: "/auth/login",
      params: { tab: "email" },
    });
  };

  const handleLogin = () => {
    router.push("/auth/login?tab=phone");
  };

  const isLoading = appleLoading || googleLoading;

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logo}>
            <AnimatedLogo />
          </View>
          <Text style={styles.appName}>CrushPoint</Text>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Choose your preferred sign up method
            </Text>

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Continue with Apple"
                onPress={handleAppleSignUp}
                icon={<AppleIcon />}
                variant="secondary"
                isLoading={appleLoading}
                isDisabled={googleLoading}
              />

              <CustomButton
                title="Continue with Google"
                onPress={handleGoogleSignUp}
                icon={<GoogleIcon />}
                variant="secondary"
                isLoading={googleLoading}
                isDisabled={appleLoading}
              />

              <CustomButton
                title="Continue with Phone"
                onPress={handlePhoneSignUp}
                icon={<PhoneIcon />}
                variant="secondary"
                isDisabled={isLoading}
              />

              <CustomButton
                title="Continue with Email"
                onPress={handleEmailSignUp}
                icon={<EmailIcon />}
                variant="secondary"
                isDisabled={isLoading}
              />
            </View>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.termsText}>
            By signing up, you agree to our{" "}
            <Text style={styles.linkText}>Terms</Text> and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: color.white,
    justifyContent: "space-between",
  },
  topSection: {
    marginTop: 80,
  },
  logo: {
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontFamily: font.semiBold,
    color: color.black,
    textAlign: "center",
    marginTop: 4,
  },
  contentContainer: {
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.gray14,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 16,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  loginText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
  },
  termsText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray69,
    textAlign: "center",
    lineHeight: 18,
    letterSpacing: 0.9,
  },
  linkText: {
    textDecorationLine: "underline",
  },
});
