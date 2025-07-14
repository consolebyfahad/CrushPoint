import AnimatedSelectionList from "@/components/AnimatedSelectionList";
import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LookingFor() {
  const { updateUserData } = useAppContext();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = [
    { id: "serious", label: "🩵 Serious relationship" },
    { id: "casual", label: "😘 Casual dating" },
    { id: "friendship", label: "🤝 Friendship" },
    { id: "open", label: "🔥 Open to possibilities" },
    { id: "prefer-not", label: "🤫 Prefer not to say" },
  ];

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedOptions(newSelection);
  };

  const handleContinue = () => {
    updateUserData({ looking_for: selectedOptions });
    router.push("/auth/interests");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>What are you looking for?</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} /> This helps
              others understand your intentions
            </Text>
          </View>
        </View>

        <AnimatedSelectionList
          options={options}
          selectedOptions={selectedOptions}
          onSelectionChange={handleSelectionChange}
          multiSelect={true}
          staggerAnimation={true}
          staggerDelay={80}
          containerStyle={styles.optionsContainer}
        />
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
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
    flex: 1,
  },
  optionsContainer: {
    paddingHorizontal: 0,
  },
  buttonContainer: {
    borderTopWidth: 1,
    padding: 16,
    borderColor: color.gray95,
  },
});
