import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function LookingFor() {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const options = [
    { id: "serious", emoji: "🩵", label: "Serious relationship" },
    { id: "casual", emoji: "😘", label: "Casual dating" },
    { id: "friendship", emoji: "🤝", label: "Friendship" },
    { id: "open", emoji: "🔥", label: "Open to possibilities" },
    { id: "prefer-not", emoji: "🤫", label: "Prefer not to say" },
  ];

  const handleOptionSelect = (optionId: any) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleContinue = () => {
    console.log("Looking for:", selectedOptions);
    router.push("/auth/interests");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header />
        <View style={styles.titleSection}>
          <Text style={styles.title}>What are you looking for?</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} /> This helps
              others understand your intentions
            </Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedOptions.includes(option.id)
                  ? styles.selectedOption
                  : styles.unselectedOption,
              ]}
              onPress={() => handleOptionSelect(option.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionText,
                  selectedOptions.includes(option.id)
                    ? styles.selectedText
                    : styles.unselectedText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Continue"
          onPress={handleContinue}
          isDisabled={selectedOptions.length === 0}
        />
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
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.gray69,
    alignItems: "center",
    justifyContent: "center",
  },
  infoIconText: {
    fontSize: 12,
    color: color.gray14,
    fontFamily: font.medium,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectedOption: {
    backgroundColor: color.gray95,
    borderColor: color.primary,
  },
  unselectedOption: {
    backgroundColor: color.white,
    borderColor: color.gray87,
  },
  emoji: {
    fontSize: 20,
  },
  optionText: {
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
