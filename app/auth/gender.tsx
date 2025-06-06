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

export default function Gender() {
  const [selectedGender, setSelectedGender] = useState("male"); // Default to male as shown in image

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
  };

  const handleContinue = () => {
    console.log("Selected gender:", selectedGender);
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
          <Text style={styles.title}>What's your gender?</Text>
          <Text style={styles.subtitle}>
            This helps us create a better experience for you
          </Text>
        </View>

        {/* Gender Selection Options */}
        <View style={styles.optionsContainer}>
          {/* Male Option */}
          <TouchableOpacity
            style={[
              styles.genderOption,
              selectedGender === "male"
                ? styles.selectedOption
                : styles.unselectedOption,
            ]}
            onPress={() => handleGenderSelect("male")}
            activeOpacity={0.8}
          >
            <MaleIcon
              color={selectedGender === "male" ? color.primary : color.gray300}
              size={48}
            />
            <Text
              style={[
                styles.genderText,
                selectedGender === "male"
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          {/* Female Option */}
          <TouchableOpacity
            style={[
              styles.genderOption,
              selectedGender === "female"
                ? styles.selectedOption
                : styles.unselectedOption,
            ]}
            onPress={() => handleGenderSelect("female")}
            activeOpacity={0.8}
          >
            <FemaleIcon
              color={
                selectedGender === "female" ? color.primary : color.gray300
              }
              size={48}
            />
            <Text
              style={[
                styles.genderText,
                selectedGender === "female"
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}
            >
              Female
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
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray300,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  genderOption: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  selectedOption: {
    backgroundColor: "#E3F2FD", // Light blue background
    borderColor: color.primary,
  },
  unselectedOption: {
    backgroundColor: color.white,
    borderColor: color.gray100,
  },
  genderText: {
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
  // Custom Gender Icon Styles
  genderIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  genderIconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
  },
  // Male arrow (top-right diagonal)
  maleArrow: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 0,
    height: 0,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderTopColor: "transparent",
  },
  // Female cross (bottom vertical line)
  femaleCross: {
    position: "absolute",
    bottom: -12,
    width: 2,
    height: 8,
  },
  // Female cross (horizontal line)
  femaleCrossVertical: {
    position: "absolute",
    bottom: -8,
    width: 6,
    height: 2,
  },
});
