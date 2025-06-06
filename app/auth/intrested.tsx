import { color, font } from "@/utils/constants";
import { FemaleIcon, MaleIcon } from "@/utils/SvgIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Back Arrow Icon Component
const BackArrowIcon = () => (
  <View style={styles.backIcon}>
    <Text style={styles.backArrowText}>←</Text>
  </View>
);

// Info Icon Component
const InfoIcon = () => (
  <View style={styles.infoIcon}>
    <Text style={styles.infoText}>i</Text>
  </View>
);

export default function Interested() {
  const [selectedInterest, setSelectedInterest] = useState("women"); // Default to women as shown in image

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleInterestSelect = (interest) => {
    setSelectedInterest(interest);
  };

  const handleContinue = () => {
    console.log("Interested in:", selectedInterest);
    // router.push("/auth/next-step");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Who are you interested in?</Text>
          <View style={styles.subtitleContainer}>
            <InfoIcon />
            <Text style={styles.subtitle}>
              This helps us show you relevant profiles nearby
            </Text>
          </View>
        </View>

        {/* Interest Selection Options */}
        <View style={styles.optionsContainer}>
          {/* Men Option */}
          <TouchableOpacity
            style={[
              styles.interestOption,
              selectedInterest === "men"
                ? styles.selectedOption
                : styles.unselectedOption,
            ]}
            onPress={() => handleInterestSelect("men")}
            activeOpacity={0.8}
          >
            <MaleIcon
              color={selectedInterest === "men" ? color.primary : color.gray300}
              size={48}
            />
            <Text
              style={[
                styles.interestText,
                selectedInterest === "men"
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}
            >
              Men
            </Text>
          </TouchableOpacity>

          {/* Women Option */}
          <TouchableOpacity
            style={[
              styles.interestOption,
              selectedInterest === "women"
                ? styles.selectedOption
                : styles.unselectedOption,
            ]}
            onPress={() => handleInterestSelect("women")}
            activeOpacity={0.8}
          >
            <FemaleIcon
              color={
                selectedInterest === "women" ? color.primary : color.gray300
              }
              size={48}
            />
            <Text
              style={[
                styles.interestText,
                selectedInterest === "women"
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}
            >
              Women
            </Text>
          </TouchableOpacity>

          {/* Both Option */}
          <TouchableOpacity
            style={[
              styles.interestOption,
              styles.bothOption,
              selectedInterest === "both"
                ? styles.selectedOption
                : styles.unselectedOption,
            ]}
            onPress={() => handleInterestSelect("both")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.interestText,
                styles.bothText,
                selectedInterest === "both"
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}
            >
              Both
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.gray100,
    borderRadius: 22,
  },
  backIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrowText: {
    fontSize: 20,
    color: color.black,
    fontFamily: font.medium,
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
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.gray300,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 10,
    fontFamily: font.medium,
    color: color.gray300,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray300,
    lineHeight: 22,
    flex: 1,
  },
  optionsContainer: {
    gap: 16,
  },
  interestOption: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  bothOption: {
    paddingVertical: 24, // Slightly less padding since no icon
  },
  selectedOption: {
    backgroundColor: "#E3F2FD", // Light blue background
    borderColor: color.primary,
  },
  unselectedOption: {
    backgroundColor: color.white,
    borderColor: color.gray100,
  },
  interestText: {
    fontSize: 18,
    fontFamily: font.semiBold,
  },
  bothText: {
    fontSize: 18,
    fontFamily: font.semiBold,
  },
  selectedText: {
    color: color.primary,
  },
  unselectedText: {
    color: color.black,
  },
  bottomSection: {
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: color.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
