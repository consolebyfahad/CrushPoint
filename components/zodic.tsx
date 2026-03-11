import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

export default function ZodiacSign({
  onClose,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const { t } = useTranslation();
  const [selectedZodiacs, setSelectedZodiacs] = useState<string[]>(
    Array.isArray(filterData.zodiacSign) ? filterData.zodiacSign : []
  );

  const zodiacSigns = [
    { id: "aries", name: t("zodiac.aries"), icon: "♈", symbol: "🐏" },
    { id: "gemini", name: t("zodiac.gemini"), icon: "♊", symbol: "👯" },
    { id: "leo", name: t("zodiac.leo"), icon: "♌", symbol: "🦁" },
    { id: "libra", name: t("zodiac.libra"), icon: "♎", symbol: "⚖️" },
    {
      id: "sagittarius",
      name: t("zodiac.sagittarius"),
      icon: "♐",
      symbol: "🏹",
    },
    { id: "aquarius", name: t("zodiac.aquarius"), icon: "♒", symbol: "🏺" },
    { id: "taurus", name: t("zodiac.taurus"), icon: "♉", symbol: "🐂" },
    { id: "cancer", name: t("zodiac.cancer"), icon: "♋", symbol: "🦀" },
    { id: "virgo", name: t("zodiac.virgo"), icon: "♍", symbol: "👩" },
    { id: "scorpio", name: t("zodiac.scorpio"), icon: "♏", symbol: "🦂" },
    { id: "capricorn", name: t("zodiac.capricorn"), icon: "♑", symbol: "🐐" },
    { id: "pisces", name: t("zodiac.pisces"), icon: "♓", symbol: "🐟" },
  ];

  const handleZodiacSelect = (zodiacId: string) => {
    setSelectedZodiacs((prev) => {
      if (prev.includes(zodiacId)) {
        
        return prev.filter((z) => z !== zodiacId);
      } else {
        
        return [...prev, zodiacId];
      }
    });
  };

  const handleSave = () => {
    setFilterData({
      ...filterData,
      zodiacSign: selectedZodiacs,
    });
    onClose();
  };

  const isSelected = (zodiacId: string) => {
    return selectedZodiacs.includes(zodiacId);
  };

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("filters.zodiacSign")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {zodiacSigns.map((zodiac, index) => (
          <TouchableOpacity
            key={zodiac.id}
            style={[
              styles.zodiacItem,
              isSelected(zodiac.id) && styles.selectedZodiacItem,
              index === zodiacSigns.length - 1 && styles.lastZodiacItem,
            ]}
            onPress={() => handleZodiacSelect(zodiac.id)}
            activeOpacity={0.7}
          >
            <View style={styles.zodiacContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.zodiacIcon}>{zodiac.icon}</Text>
              </View>
              <Text
                style={[
                  styles.zodiacText,
                  isSelected(zodiac.id) && styles.selectedZodiacText,
                ]}
              >
                {zodiac.name}
              </Text>
            </View>
            {isSelected(zodiac.id) && (
              <Ionicons name="checkmark" size={20} color={color.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {}
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
    backgroundColor: "#F3E8FF",  
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  zodiacIcon: {
    fontSize: 16,
    color: "#8B5CF6",  
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
