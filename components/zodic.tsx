import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ZodiacSign({
  onClose,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const [selectedZodiacs, setSelectedZodiacs] = useState<string[]>(
    Array.isArray(filterData.zodiacSign) ? filterData.zodiacSign : []
  );

  const zodiacSigns = [
    { id: "aries", name: "Aries", icon: "♈", symbol: "🐏" },
    { id: "gemini", name: "Gemini", icon: "♊", symbol: "👯" },
    { id: "leo", name: "Leo", icon: "♌", symbol: "🦁" },
    { id: "libra", name: "Libra", icon: "♎", symbol: "⚖️" },
    { id: "sagittarius", name: "Sagittarius", icon: "♐", symbol: "🏹" },
    { id: "aquarius", name: "Aquarius", icon: "♒", symbol: "🏺" },
    { id: "taurus", name: "Taurus", icon: "♉", symbol: "🐂" },
    { id: "cancer", name: "Cancer", icon: "♋", symbol: "🦀" },
    { id: "virgo", name: "Virgo", icon: "♍", symbol: "👩" },
    { id: "scorpio", name: "Scorpio", icon: "♏", symbol: "🦂" },
    { id: "capricorn", name: "Capricorn", icon: "♑", symbol: "🐐" },
    { id: "pisces", name: "Pisces", icon: "♓", symbol: "🐟" },
  ];

  const handleZodiacSelect = (zodiac: string) => {
    setSelectedZodiacs((prev) => {
      if (prev.includes(zodiac)) {
        // Remove zodiac if already selected
        return prev.filter((z) => z !== zodiac);
      } else {
        // Add zodiac if not selected
        return [...prev, zodiac];
      }
    });
  };

  const handleSave = () => {
    setFilterData({
      ...filterData,
      zodiacSign: selectedZodiacs,
    });
    console.log("Selected zodiac signs:", selectedZodiacs);
    onClose();
  };

  // Check if zodiac is selected
  const isSelected = (zodiac: string) => {
    return selectedZodiacs.includes(zodiac);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Zodiac Sign</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Zodiac List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {zodiacSigns.map((zodiac, index) => (
          <TouchableOpacity
            key={zodiac.id}
            style={[
              styles.zodiacItem,
              isSelected(zodiac.name) && styles.selectedZodiacItem,
              index === zodiacSigns.length - 1 && styles.lastZodiacItem,
            ]}
            onPress={() => handleZodiacSelect(zodiac.name)}
            activeOpacity={0.7}
          >
            <View style={styles.zodiacContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.zodiacIcon}>{zodiac.icon}</Text>
              </View>
              <Text
                style={[
                  styles.zodiacText,
                  isSelected(zodiac.name) && styles.selectedZodiacText,
                ]}
              >
                {zodiac.name}
              </Text>
            </View>
            {isSelected(zodiac.name) && (
              <Ionicons name="checkmark" size={20} color={color.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedZodiacs.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={selectedZodiacs.length === 0}
        >
          <Text
            style={[
              styles.saveButtonText,
              selectedZodiacs.length === 0 && styles.saveButtonTextDisabled,
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
    minHeight: SCREEN_HEIGHT * 0.8,
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
    paddingTop: 8,
  },
  zodiacItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastZodiacItem: {
    borderBottomWidth: 0,
  },
  zodiacContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3E8FF", // Light purple background
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  zodiacIcon: {
    fontSize: 16,
    color: "#8B5CF6", // Purple color for the zodiac symbols
  },
  zodiacText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    flex: 1,
  },
  selectedZodiacItem: {
    backgroundColor: "#F0F9FF",
    borderColor: color.primary,
  },
  selectedZodiacText: {
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
