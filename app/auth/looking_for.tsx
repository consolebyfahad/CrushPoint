import AnimatedSelectionList from "@/components/AnimatedSelectionList";
import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { LOOKING_FOR_OPTIONS } from "@/utils/helper";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LookingFor() {
  const { t } = useTranslation();
  const { updateUserData } = useAppContext();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Use base options from helper and translate labels
  const options = useMemo(() => {
    return LOOKING_FOR_OPTIONS.map((option) => ({
      id: option.id,
      label: `${option.emoji} ${t(option.translationKey)}`,
    }));
  }, [t]);

  const handleSelectionChange = (newSelection: string[]) => {
    if (newSelection.includes("prefer-not")) {
      setSelectedOptions(["prefer-not"]);
    } else {
      const filteredSelection = newSelection.filter(
        (option) => option !== "prefer-not"
      );
      setSelectedOptions(filteredSelection);
    }
  };

  const handleContinue = () => {
    updateUserData({
      looking_for: selectedOptions,
    });
    router.push("/auth/interests");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {t("lookingFor.whatAreYouLookingFor")}
          </Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} />{" "}
              {t("lookingFor.selectAllThatApply")}
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
          title={t("continue")}
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
