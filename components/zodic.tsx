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
  onSelect,
}: any) {
  const [selectedZodiac, setSelectedZodiac] = useState(
    filterData.zodiacSign || "Cancer"
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
    setSelectedZodiac(zodiac);
    // Save the selection and auto close after selection
    setFilterData({
      ...filterData,
      zodiacSign: zodiac,
    });
    setTimeout(() => {
      console.log("Selected zodiac sign:", zodiac);
      onSelect();
    }, 200);
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
              index === zodiacSigns.length - 1 && styles.lastZodiacItem,
            ]}
            onPress={() => handleZodiacSelect(zodiac.name)}
            activeOpacity={0.7}
          >
            <View style={styles.zodiacContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.zodiacIcon}>{zodiac.icon}</Text>
              </View>
              <Text style={styles.zodiacText}>{zodiac.name}</Text>
            </View>
            {selectedZodiac === zodiac.name && (
              <Ionicons name="checkmark" size={20} color="#5FB3D4" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
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
});
