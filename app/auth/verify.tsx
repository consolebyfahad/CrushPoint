import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Verify() {
  const params = useLocalSearchParams();
  const { user, loginUser } = useAppContext();
  const { showToast } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const contactType = params.type || "phone";
  const contactInfo = params.contact || "+155 (500) 000-00";
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const animatedValues = useRef(code.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.slice(-1);

    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Animate current box
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerifyCode(fullCode);
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (fullCode: string) => {
    if (!user?.user_id) {
      showToast("User session expired. Please login again.", "error");
      router.push("/welcome");
      return;
    }

    setIsVerifying(true);

    try {
      // Development mode: Accept hardcoded PIN 123456 for testing
      const isDevelopmentMode = __DEV__;
      const isHardcodedPIN = fullCode === "123456";

      if (isDevelopmentMode && isHardcodedPIN) {
        console.log("🔧 Development mode: Using hardcoded PIN 123456");
        await loginUser(user);
        setCode(["", "", "", "", "", ""]);

        if (user?.new) {
          router.push("/auth/gender");
        } else {
          router.push("/(tabs)");
        }
        return;
      }

      const formData = new FormData();
      formData.append("type", "verify_otp");
      formData.append("user_id", user?.user_id);
      formData.append("code", fullCode);
      const response = await apiCall(formData);

      if (response.result) {
        await loginUser(user);
        setCode(["", "", "", "", "", ""]);
        if (user?.new) {
          router.push("/auth/gender");
        } else {
          router.push("/(tabs)");
        }
      } else {
        showToast(response.message || "Invalid verification code", "error");
        console.error("Verification Error:", response.message);
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
      console.error("Verification Error:", error);

      setCode(["", "", "", "", "", ""]);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !user?.user_id) return;

    try {
      const formData = new FormData();
      formData.append("type", "resend_otp");
      formData.append("user_id", user.user_id);
      // formData.append("contact_type", contactType);

      const response = await apiCall(formData);

      if (response.success) {
        showToast("Verification code sent!", "success");

        // Reset countdown and state
        setResendCountdown(59);
        setCanResend(false);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();

        // Start new countdown timer
        const timer = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showToast(response.message || "Failed to resend code", "error");
      }
    } catch (error) {
      showToast("Failed to resend code. Please try again.", "error");
      console.error("Resend Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {isVerifying ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Verify your {contactType}</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code we sent to {contactInfo}
            </Text>
          </View>

          {/* PIN Input Boxes */}
          <View style={styles.pinContainer}>
            {code.map((digit, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.pinBoxContainer,
                  {
                    transform: [{ scale: animatedValues[index] }],
                  },
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[styles.pinBox, digit ? styles.pinBoxFilled : null]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(event) => handleKeyPress(event, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                  editable={!isVerifying}
                  caretHidden={false}
                />
              </Animated.View>
            ))}
          </View>

          {/* Resend Code Button */}
          <CustomButton
            title={
              canResend ? "Resend Code" : `Resend code in ${resendCountdown}s`
            }
            onPress={handleResendCode}
            isDisabled={!canResend || isVerifying}
            isLoading={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  titleSection: {
    marginBottom: 42,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
  },
  pinBoxContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  pinBox: {
    height: 56,
    borderWidth: 1,
    borderColor: color.gray87,
    borderRadius: 12,
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    backgroundColor: color.white,
    textAlign: "center",
    paddingTop: 0,
    paddingBottom: 0,
  },
  pinBoxFilled: {
    borderColor: color.primary,
    backgroundColor: color.white,
  },
});
