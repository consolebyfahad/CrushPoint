import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { FemaleIcon, MaleIcon } from "@/utils/SvgIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Interested() {
  const [selectedInterest, setSelectedInterest] = useState("women");

  const handleInterestSelect = (interest: any) => {
    setSelectedInterest(interest);
  };

  const handleContinue = () => {
    console.log("Interested in:", selectedInterest);
    router.push("/auth/about");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <Header />

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Who are you interested in?</Text>
          <View style={styles.subtitleContainer}>
            {/* <InfoIcon /> */}
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
            <MaleIcon />
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
            <FemaleIcon />
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
      <CustomButton title="Continue" onPress={handleContinue} />
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
    paddingTop: 30,
  },
  titleSection: {
    marginBottom: 40,
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
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  bothOption: {
    paddingVertical: 18, // Slightly less padding since no icon
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
});
