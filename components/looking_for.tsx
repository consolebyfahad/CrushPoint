import { color, font } from "@/utils/constants";
import { LOOKING_FOR_OPTIONS } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LookingFor({
  onClose,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const { t } = useTranslation();
  // Changed to array to support multiple selections
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    Array.isArray(filterData.lookingFor) ? filterData.lookingFor : []
  );

  // Use base options from helper and translate labels
  const lookingForOptions = useMemo(() => {
    return LOOKING_FOR_OPTIONS.map((option) => ({
      id: option.id,
      title: t(option.translationKey),
      emoji: option.emoji,
      color: "#3B82F6", // Default color, can be customized per option if needed
    }));
  }, [t]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        // Remove option if already selected
        return prev.filter((option) => option !== optionId);
      } else {
        // Add option if not selected
        return [...prev, optionId];
      }
    });
  };

  const handleSave = () => {
    setFilterData({
      ...filterData,
      lookingFor: selectedOptions,
    });
    onClose();
  };

  // Check if option is selected
  const isSelected = (optionId: string) => {
    return selectedOptions.includes(optionId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("lookingFor.lookingFor")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Looking For List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {lookingForOptions.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionItem,
              isSelected(option.id) && styles.selectedOption,
              index === lookingForOptions.length - 1 && styles.lastOptionItem,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  isSelected(option.id) && styles.selectedOptionText,
                ]}
              >
                {option.title}
              </Text>
            </View>
            {isSelected(option.id) && (
              <Ionicons name="checkmark" size={20} color={color.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected count */}
      {/* {selectedOptions.length > 0 && (
        <View style={styles.selectedCountContainer}>
          <Text style={styles.selectedCountText}>
            {selectedOptions.length} option
            {selectedOptions.length !== 1 ? "s" : ""} selected
          </Text>
        </View>
      )} */}

      {/* Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedOptions.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={selectedOptions.length === 0}
        >
          <Text
            style={[
              styles.saveButtonText,
              selectedOptions.length === 0 && styles.saveButtonTextDisabled,
            ]}
          >
            {t("save")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.6,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    borderColor: color.primary,
    backgroundColor: "#F0F9FF",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    backgroundColor: "#F3E8FF",
  },
  optionEmoji: {
    fontSize: 16,
  },
  optionText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    flex: 1,
  },
  selectedOptionText: {
    color: color.primary,
  },
  selectedCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  selectedCountText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  saveButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: color.primary,
  },
  saveButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
  saveButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
