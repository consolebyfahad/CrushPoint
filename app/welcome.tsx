import CustomButton from "@/components/custom_button";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { AnimatedLogo } from "@/utils//animations";
import { requestFullCameraAccess } from "@/utils/camera";
import { color, font } from "@/utils/constants";
import SocialAuth from "@/utils/social_auth";
import { EmailIcon, PhoneIcon } from "@/utils/SvgIcons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const { setUser } = useAppContext();
  const { showToast } = useToast();
  const [otherMethodsLoading, setOtherMethodsLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    requestCameraPermissions();
    return () => backHandler.remove();
  }, []);

  const requestCameraPermissions = async () => {
    try {
      const permissions = await requestFullCameraAccess();

      if (permissions.camera && permissions.mediaLibrary) {
        showToast("Camera permissions granted!", "success");
      } else if (permissions.camera) {
        showToast(
          "Camera access granted, but media library access denied",
          "warning"
        );
      } else if (permissions.mediaLibrary) {
        showToast(
          "Media library access granted, but camera access denied",
          "warning"
        );
      } else {
        showToast(
          "Camera permissions denied. You can enable them in settings.",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to request camera permissions:", error);
      showToast("Failed to request camera permissions", "error");
    }
  };

  // Handle successful social authentication
  const handleSocialAuthSuccess = (
    userData: any,
    provider: "apple" | "google"
  ) => {
    setUser(userData);

    router.push({
      pathname: "/auth/verify",
      params: {
        type: `${provider} account`,
        contact: `${provider} account`,
      },
    });
  };

  // Handle social authentication errors
  const handleSocialAuthError = (message: string) => {
    showToast(message, "error");
  };

  const handlePhoneSignUp = () => {
    setOtherMethodsLoading(true);
    router.push({
      pathname: "/auth/login",
      params: { tab: "phone" },
    });
    setOtherMethodsLoading(false);
  };

  const handleEmailSignUp = () => {
    setOtherMethodsLoading(true);
    router.push({
      pathname: "/auth/login",
      params: { tab: "email" },
    });
    setOtherMethodsLoading(false);
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
              {/* Social Authentication Component */}
              <SocialAuth
                onAuthSuccess={handleSocialAuthSuccess}
                onAuthError={handleSocialAuthError}
                isDisabled={otherMethodsLoading}
              />

              {/* Other sign-up methods */}
              <CustomButton
                title="Continue with Phone"
                onPress={handlePhoneSignUp}
                icon={<PhoneIcon />}
                variant="secondary"
                isLoading={otherMethodsLoading}
              />

              <CustomButton
                title="Continue with Email"
                onPress={handleEmailSignUp}
                icon={<EmailIcon />}
                variant="secondary"
                isLoading={otherMethodsLoading}
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
