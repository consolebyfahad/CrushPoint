import CustomButton from "@/components/custom_button";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font, image } from "@/utils/constants";
import { AppleIcon, EmailIcon, GoogleIcon, PhoneIcon } from "@/utils/SvgIcons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedLogo = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotateAnim, scaleAnim]);

  const scale = scaleAnim;
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale }, { rotate: rotation }],
        },
      ]}
    >
      <Image
        source={image.splash}
        style={{
          resizeMode: "cover",
          marginBottom: 0,
        }}
      />
    </Animated.View>
  );
};

export default function Welcome() {
  const { setIsLoggedIn, setUser } = useAppContext();
  const { showToast } = useToast();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
        setIsLoggedIn(true);

        showToast("Login successful!", "success");

        router.push("/auth/verify");
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
        setIsLoggedIn(true);
        showToast("Login successful!", "success");
        router.push("/auth/verify");
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
    console.log("Continue with Phone");
    router.push({
      pathname: "/auth/login",
      params: { tab: "phone" },
    });
  };

  const handleEmailSignUp = () => {
    console.log("Continue with Email");
    router.push({
      pathname: "/auth/login",
      params: { tab: "email" },
    });
  };

  const handleLogin = () => {
    console.log("Navigate to Login");
    router.push("/auth/login?tab=phone");
  };

  return (
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
            />

            {/* Email Button */}
            <CustomButton
              title="Continue with Email"
              onPress={handleEmailSignUp}
              icon={<EmailIcon />}
              variant="secondary"
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
