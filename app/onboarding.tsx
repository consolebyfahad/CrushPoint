import { default as Icon1 } from "@/assets/images/onboarding1.svg";
import { default as Icon2 } from "@/assets/images/onboarding2.svg";
import { default as Icon3 } from "@/assets/images/onboarding3.svg";
import { default as Icon4 } from "@/assets/images/onboarding4.svg";

import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const onboardingData = [
  {
    id: 1,
    IconComponent: Icon1,
    title: "Love at first sight.",
    description:
      "Meet your soulmate in real life.\nForget swiping left and right.",
  },
  {
    id: 2,
    IconComponent: Icon2,
    title: "Find nearby matches.",
    description:
      "Discover people around you who share\nyour interests and values.",
  },
  {
    id: 3,
    IconComponent: Icon3,
    title: "Start meaningful conversations.",
    description:
      "Connect through authentic conversations\nand build real relationships.",
  },
  {
    id: 4,
    IconComponent: Icon4,
    title: "Meet people on events",
    description: "See if someone interesting is joinung the same event as you",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentData = onboardingData[currentIndex];
  const isLastScreen = currentIndex === onboardingData.length - 1;

  const handleContinue = () => {
    if (isLastScreen) {
      router.push("/welcome");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    router.push("/welcome");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <currentData.IconComponent />
        </View>

        {/* Title */}
        <Text style={styles.title}>{currentData.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{currentData.description}</Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            {isLastScreen ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    paddingHorizontal: 32,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    color: color.gray300,
    fontFamily: font.medium,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray300,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomContainer: {
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.gray100,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: color.primary,
    width: 8,
  },
  continueButton: {
    backgroundColor: color.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  continueText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
