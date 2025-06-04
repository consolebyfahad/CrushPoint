import { color, font } from "@/utils/constants";
import { useNavigation } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { onboardingData } from "./OnboardingData";

export const onboardingData = [
  {
    id: 1,
    icon: require("../assets/images/heart-icon.png"),
    title: "Love at first sight.",
    description:
      "Meet your soulmate in real life.\nForget swiping left and right.",
  },
  {
    id: 2,
    icon: require("../assets/images/location-icon.png"),
    title: "Find nearby matches.",
    description:
      "Discover people around you who share\nyour interests and values.",
  },
  {
    id: 3,
    icon: require("../assets/images/chat-icon.png"),
    title: "Start meaningful conversations.",
    description:
      "Connect through authentic conversations\nand build real relationships.",
  },
  {
    id: 4,
    icon: require("../assets/images/date-icon.png"),
    title: "Meet in person.",
    description:
      "Plan your first date and create\nunforgettable memories together.",
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentData = onboardingData[currentIndex];
  const isLastScreen = currentIndex === onboardingData.length - 1;

  const handleContinue = () => {
    if (isLastScreen) {
      // navigation.navigate("GetStarted");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    // navigation.navigate("GetStarted");
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Image source={currentData.icon} style={styles.icon} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    // color: color.gray,
    fontFamily: font.medium,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: color.primary,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  icon: {
    width: 50,
    height: 50,
    tintColor: color.white,
  },
  title: {
    fontSize: 28,
    fontFamily: font.bold,
    // color: color.black,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: font.regular,
    // color: color.gray,
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
    // backgroundColor: color.lightGray,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: color.primary,
    width: 24,
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
