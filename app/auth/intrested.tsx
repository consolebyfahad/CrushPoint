import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { FemaleIcon, MaleIcon } from "@/utils/SvgIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Interested() {
  const { updateUserData } = useAppContext();
  const [selectedInterest, setSelectedInterest] = useState("both");

  const handleInterestSelect = (interest: any) => {
    setSelectedInterest(interest);
  };

  const handleContinue = () => {
    updateUserData({ gender_interest: selectedInterest });
    router.push("/auth/about");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Who are you interested in?</Text>
          <View style={styles.subtitleContainer}>
            {/* <InfoIcon /> */}
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} /> This helps
              us show you relevant profiles nearby
            </Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {/* Men Option */}
          <TouchableOpacity
            style={[
              styles.interestOption,
              selectedInterest === "male"
                ? styles.selectedOption
                : styles.unselectedOption,
            ]}
            onPress={() => handleInterestSelect("male")}
            activeOpacity={0.8}
          >
            <MaleIcon />
            <Text
              style={[
                styles.interestText,
                selectedInterest === "male"
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
              selectedInterest === "female"
                ? styles.selectedOption
                : styles.unselectedOption,
            ]}
            onPress={() => handleInterestSelect("female")}
            activeOpacity={0.8}
          >
            <FemaleIcon />
            <Text
              style={[
                styles.interestText,
                selectedInterest === "female"
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
                styles.interestText,
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

      <View style={styles.buttonContainer}>
        <CustomButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    paddingTop: 40,
    marginBottom: 32,
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
    color: color.gray55,
    lineHeight: 22,
    flex: 1,
  },
  optionsContainer: {
    gap: 14,
  },
  interestOption: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  bothOption: {
    paddingVertical: 16,
  },
  selectedOption: {
    backgroundColor: color.gray95,
    borderColor: color.primary,
  },
  unselectedOption: {
    backgroundColor: color.white,
    borderColor: color.gray87,
  },
  interestText: {
    fontSize: 18,
    fontFamily: font.medium,
  },
  selectedText: {
    color: color.primary,
  },
  unselectedText: {
    color: color.black,
  },
  buttonContainer: {
    borderTopWidth: 1,
    padding: 16,
    borderColor: color.gray95,
  },
});
