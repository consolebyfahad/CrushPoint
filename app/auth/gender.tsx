import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { FemaleIcon, MaleIcon } from "@/utils/SvgIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Gender() {
  const [selectedGender, setSelectedGender] = useState("male");

  const handleGenderSelect = (gender: any) => {
    setSelectedGender(gender);
  };

  const handleContinue = () => {
    console.log("Selected gender:", selectedGender);
    router.push("/auth/intrested");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header />
        <View style={styles.titleSection}>
          <Text style={styles.title}>{"What's your gender?"}</Text>
          <Text style={styles.subtitle}>
            <Octicons name="info" size={14} color={color.gray55} /> This helps
            us create a better experience for you
          </Text>
        </View>

        <View style={styles.optionsContainer}>
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
            <MaleIcon />
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
            <FemaleIcon />
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
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  genderOption: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  selectedOption: {
    backgroundColor: color.gray95,
    borderColor: color.primary,
  },
  unselectedOption: {
    backgroundColor: color.white,
    borderColor: color.gray87,
  },
  genderText: {
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
