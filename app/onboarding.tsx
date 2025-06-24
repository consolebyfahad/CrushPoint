import CustomButton from "@/components/custom_button";
import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const onboardingData = [
  {
    id: 1,
    IconComponent: svgIcon.Onboarding1,
    title: "Love at first sight.",
    description:
      "Meet your soulmate in real life.\nForget swiping left and right.",
  },
  {
    id: 2,
    IconComponent: svgIcon.Onboarding2,
    title: "See who's around you",
    description: "Discover interesting people nearby and connect in real life",
  },
  {
    id: 3,
    IconComponent: svgIcon.Onboarding3,
    title: "Send a reaction",
    description: "Express interest with fun emojis - no chat needed",
  },
  {
    id: 4,
    IconComponent: svgIcon.Onboarding4,
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
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>{currentData.IconComponent}</View>
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>
      </View>

      <View style={styles.bottomContainer}>
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

        <CustomButton
          title={isLastScreen ? "Get Started" : "Continue"}
          onPress={handleContinue}
          rightIcon={
            <Feather name="arrow-right" size={18} color={color.white} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    padding: 16,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    color: color.gray55,
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
    color: color.gray55,
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
    backgroundColor: color.gray87,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: color.primary,
    width: 8,
  },
});
