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
  const [selectedOption, setSelectedOption] = useState(
    filterData.lookingFor || "Casual Dating"
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

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSave = () => {
    // Save the selected option logic here
    setFilterData({
      ...filterData,
      lookingFor: selectedOption,
    });
    console.log("Selected looking for:", selectedOption);
    onClose();
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
              selectedOption === option.title && styles.selectedOption,
            ]}
            onPress={() => handleOptionSelect(option.title)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option.title && styles.selectedOptionText,
                ]}
              >
                {option.title}
              </Text>
            </View>
            {selectedOption === option.title && (
              <Ionicons name="checkmark" size={24} color={color.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save</Text>
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
  saveButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
