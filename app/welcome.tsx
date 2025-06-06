import { color, font, image } from "@/utils/constants";
import { AppleIcon, EmailIcon, GoogleIcon, PhoneIcon } from "@/utils/SvgIcons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
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

// Animated Heart Logo Component
const AnimatedLogo = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start();

    // Subtle rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
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
        source={image.icon}
        style={{
          height: 100,
          width: 140,
          resizeMode: "cover",
          marginBottom: 0,
        }}
      />
    </Animated.View>
  );
};

export default function Welcome() {
  const handleAppleSignUp = () => {
    console.log("Continue with Apple");
    // Implement Apple Sign-In
  };

  const handleGoogleSignUp = () => {
    console.log("Continue with Google");
    // Implement Google Sign-In
  };

  const handlePhoneSignUp = () => {
    console.log("Continue with Phone");
    router.push("/auth/login");
  };

  const handleEmailSignUp = () => {
    console.log("Continue with Email");
    router.push("/auth/login");
  };

  const handleLogin = () => {
    console.log("Navigate to Login");
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section with Logo */}
      <View style={styles.topSection}>
        <AnimatedLogo />
        <Text style={styles.appName}>CrushPoint</Text>
      </View>

      {/* Content Section */}
      <View>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>
          Choose your preferred sign up method
        </Text>

        {/* Sign Up Buttons */}
        <View style={styles.buttonContainer}>
          {/* Apple Button */}
          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={handleAppleSignUp}
          >
            <AppleIcon />
            <Text style={[styles.buttonText]}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google Button */}
          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={handleGoogleSignUp}
          >
            <GoogleIcon />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Phone Button */}
          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={handlePhoneSignUp}
          >
            <PhoneIcon />
            <Text style={styles.buttonText}>Continue with Phone</Text>
          </TouchableOpacity>

          {/* Email Button */}
          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={handleEmailSignUp}
          >
            <EmailIcon />
            <Text style={styles.buttonText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Section */}
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
    paddingHorizontal: 24,
    backgroundColor: color.white,
    justifyContent: "space-between",
  },
  topSection: {
    marginTop: 30,
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontFamily: font.semiBold,
    color: color.black,
    textAlign: "center",
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.gray400,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray300,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  appleButton: {
    backgroundColor: color.black,
  },
  socialButton: {
    borderWidth: 1,
    backgroundColor: color.white,
    borderColor: color.gray100,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray400,
  },
  appleButtonText: {
    color: color.white,
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
    color: color.gray300,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
  },

  termsText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray200,
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: "underline",
  },
});
