import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
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
  // Changed to array to support multiple selections
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    Array.isArray(filterData.lookingFor) ? filterData.lookingFor : []
  );

  const lookingForOptions = [
    {
      id: "serious",
      title: "Serious Relationship",
      emoji: "💙",
      color: "#3B82F6",
    },
    {
      id: "casual",
      title: "Casual Dating",
      emoji: "😊",
      color: "#F59E0B",
    },
    {
      id: "friendship",
      title: "Friendship",
      emoji: "🤝",
      color: "#10B981",
    },
    {
      id: "open",
      title: "Open To Possibilities",
      emoji: "🔥",
      color: "#EF4444",
    },
  ];

  const handleOptionSelect = (optionTitle: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionTitle)) {
        // Remove option if already selected
        return prev.filter((option) => option !== optionTitle);
      } else {
        // Add option if not selected
        return [...prev, optionTitle];
      }
    });
  };

  const handleSave = () => {
    setFilterData({
      ...filterData,
      lookingFor: selectedOptions,
    });
    console.log("Selected looking for:", selectedOptions);
    onClose();
  };

  // Check if option is selected
  const isSelected = (optionTitle: string) => {
    return selectedOptions.includes(optionTitle);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Looking for</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {lookingForOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionItem,
              isSelected(option.title) && styles.selectedOption,
            ]}
            onPress={() => handleOptionSelect(option.title)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionText,
                  isSelected(option.title) && styles.selectedOptionText,
                ]}
              >
                {option.title}
              </Text>
            </View>
            {isSelected(option.title) && (
              <Ionicons name="checkmark" size={24} color={color.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

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
            Save
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
    paddingTop: 24,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: color.white,
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
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
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
