import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Verify() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);

  // Create refs for each input
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const animatedValues = useRef(code.map(() => new Animated.Value(1))).current;

  // Phone number from previous screen (in real app, get from route params)
  const phoneNumber = "+155 (500) 000-00";

  useEffect(() => {
    // Auto-focus first input when component mounts
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
    // Only allow single digit
    const digit = text.slice(-1);

    if (digit && !/^\d$/.test(digit)) {
      return; // Only allow digits
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

    // Move to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if code is complete
    if (digit && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerifyCode(fullCode);
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    // Handle backspace to move to previous input
    if (event.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = (fullCode: string) => {
    console.log("Verifying code:", fullCode);
    router.push("/auth/gender");
    // setCode(["", "", "", "", ""]);
    // Add verification logic here
    // router.push("/auth/success");
  };

  const handleResendCode = () => {
    if (canResend) {
      console.log("Resending code...");
      setResendCountdown(50);
      setCanResend(false);

      // Clear current code
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Restart countdown
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <Header />
      {/* Content */}
      <View style={styles.content}>
        {/* Title and Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to {phoneNumber}
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
                editable={true}
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
          isDisabled={!canResend}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  titleSection: {
    marginBottom: 60,
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
    color: color.gray300,
    lineHeight: 22,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
    paddingHorizontal: 8,
  },
  pinBoxContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  pinBox: {
    height: 56,
    borderWidth: 1,
    borderColor: color.gray100,
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
