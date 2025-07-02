import CustomButton from "@/components/custom_button";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { AnimatedLogo } from "@/utils//animations";
import { apiCall } from "@/utils/api";
import { requestFullCameraAccess } from "@/utils/camera";
import { color, font } from "@/utils/constants";
import { requestUserLocation } from "@/utils/location";
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
      let deviceModel = "unknown";
      if (Device.modelName) {
        deviceModel = Device.modelName;
      }

      return {
        platform: Platform.OS || "",
        model: deviceModel,
      };
    } catch (error) {
      console.error("Error getting device info:", error);
      return {
        platform: Platform.OS || "",
        model: "unknown",
        brand: "unknown",
        osVersion: "unknown",
      };
    }
  };

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     () => true
  //   );
  //   return () => backHandler.remove();
  // }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permissionGranted = await requestFCMPermission();
        if (permissionGranted) {
          const token = await getFCMToken();
          const deviceInfo = await getDeviceInfo();
          const formData = new FormData();
          formData.append("type", "update_noti");
          formData.append("user_id", user?.user_id ? user?.user_id : "");
          formData.append("devicePlatform", deviceInfo.platform);
          formData.append("deviceRid", token || "");
          formData.append("deviceModel", deviceInfo.model);
          try {
            const response = await apiCall(formData);
            console.log("FCM registration response:", response);
          } catch (error) {
            console.error("FCM registration failed:", error);
          }
        } else {
          console.log("FCM permission not granted");
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };
    setupNotifications();

    const requestPermissions = async () => {
      try {
        // Then request location permission
        const location = await requestUserLocation();
        if (location) {
          const userData = {
            lat: location?.latitude,
            lng: location.longitude,
          };
        } else {
          console.log("❌ Location permission denied");
        }

        // Finally request camera permissions
        const cameraPermissions = await requestFullCameraAccess();
        if (cameraPermissions.camera && cameraPermissions.mediaLibrary) {
          // console.log("✅ All camera permissions granted");
        } else {
          console.log("❌ Some camera permissions denied:", cameraPermissions);
        }
      } catch (error) {
        console.error("Error requesting permissions:", error);
      }
    };
    requestPermissions();

    const handleNotificationPress = (data: any) => {
      console.log("🔔 Notification Pressed:", data);
    };
    const unsubscribe = setupNotificationListeners(handleNotificationPress);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAppleSignUp = async () => {
    setAppleLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("token", "1");

      const response = await apiCall(formData);

      if (response.success) {
        console.log("response", response);

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
            type: "apple account",
            contact: "apple account",
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
      setAppleLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "social_login");
      formData.append("token", "2");

      const response = await apiCall(formData);

      if (response.success) {
        console.log("response", response);

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
            type: "google account",
            contact: "google account",
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
      setGoogleLoading(false);
    }
  };

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
              {/* Apple Button */}
              <CustomButton
                title="Continue with Apple"
                onPress={handleAppleSignUp}
                icon={<AppleIcon />}
                variant="secondary"
                isLoading={appleLoading}
                isDisabled={googleLoading}
              />

              {/* Google Button */}
              <CustomButton
                title="Continue with Google"
                onPress={handleGoogleSignUp}
                icon={<GoogleIcon />}
                variant="secondary"
                isLoading={googleLoading}
                isDisabled={appleLoading}
              />

              {/* Phone Button */}
              <CustomButton
                title="Continue with Phone"
                onPress={handlePhoneSignUp}
                icon={<PhoneIcon />}
                variant="secondary"
                isDisabled={appleLoading || googleLoading}
              />

              {/* Email Button */}
              <CustomButton
                title="Continue with Email"
                onPress={handleEmailSignUp}
                icon={<EmailIcon />}
                variant="secondary"
                isDisabled={appleLoading || googleLoading}
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
