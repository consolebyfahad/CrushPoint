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

export default function Religion({
  onClose,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const { t } = useTranslation();
  const [selectedReligions, setSelectedReligions] = useState<string[]>(
    Array.isArray(filterData.religion) ? filterData.religion : []
  );

  const religions = [
    { id: "christianity", name: "Christianity", icon: "✝️", color: "#8B5CF6" },
    { id: "islam", name: "Islam", icon: "☪️", color: "#8B5CF6" },
    { id: "hinduism", name: "Hinduism", icon: "🕉️", color: "#8B5CF6" },
    { id: "buddhism", name: "Buddhism", icon: "☸️", color: "#8B5CF6" },
    { id: "judaism", name: "Judaism", icon: "✡️", color: "#8B5CF6" },
    { id: "others", name: "Others", icon: "🌍", color: "#60A5FA" },
    // { id: "any", name: "Any", icon: "🤲", color: "#A3A3A3" },
  ];

  const handleReligionSelect = (religion: string) => {
    setSelectedReligions((prev) => {
      if (prev.includes(religion)) {
        // Remove religion if already selected
        return prev.filter((r) => r !== religion);
      } else {
        // Add religion if not selected
        return [...prev, religion];
      }
    });
  };

  const handleSave = () => {
    setFilterData({
      ...filterData,
      religion: selectedReligions,
    });
    onClose();
  };

  // Check if religion is selected
  const isSelected = (religion: string) => {
    return selectedReligions.includes(religion);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("filters.religion")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Religion List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {religions.map((religion, index) => (
          <TouchableOpacity
            key={religion.id}
            style={[
              styles.religionItem,
              isSelected(religion.name) && styles.selectedReligionItem,
              index === religions.length - 1 && styles.lastReligionItem,
            ]}
            onPress={() => handleReligionSelect(religion.name)}
            activeOpacity={0.7}
          >
            <View style={styles.religionContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${religion.color}15` },
                ]}
              >
                <Text style={styles.religionIcon}>{religion.icon}</Text>
              </View>
              <Text
                style={[
                  styles.religionText,
                  isSelected(religion.name) && styles.selectedReligionText,
                ]}
              >
                {religion.name}
              </Text>
            </View>
            {isSelected(religion.name) && (
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
            selectedReligions.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={selectedReligions.length === 0}
        >
          <Text
            style={[
              styles.saveButtonText,
              selectedReligions.length === 0 && styles.saveButtonTextDisabled,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  religionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastReligionItem: {
    borderBottomWidth: 0,
  },
  religionContent: {
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
  },
  religionIcon: {
    fontSize: 16,
  },
  religionText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    flex: 1,
  },
  selectedReligionItem: {
    backgroundColor: "#F0F9FF",
    borderColor: color.primary,
  },
  selectedReligionText: {
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
