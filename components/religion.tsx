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

export default function Religion({
  onClose,
  onBack,
  filterData,
  setFilterData,
  onSelect,
}: any) {
  const [selectedReligion, setSelectedReligion] = useState(
    filterData.religion || "Christianity"
  );

  const religions = [
    { id: "christianity", name: "Christianity", icon: "✝️", color: "#8B5CF6" },
    { id: "islam", name: "Islam", icon: "☪️", color: "#8B5CF6" },
    { id: "hinduism", name: "Hinduism", icon: "🕉️", color: "#8B5CF6" },
    { id: "buddhism", name: "Buddhism", icon: "☸️", color: "#8B5CF6" },
    { id: "judaism", name: "Judaism", icon: "✡️", color: "#8B5CF6" },
    { id: "others", name: "Others", icon: "🌍", color: "#60A5FA" },
    { id: "any", name: "Any", icon: "🤲", color: "#A3A3A3" },
  ];

  const handleReligionSelect = (religion: string) => {
    setSelectedReligion(religion);
    // Save the selection and auto close after selection
    setFilterData({
      ...filterData,
      religion: religion,
    });
    setTimeout(() => {
      console.log("Selected religion:", religion);
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
        <Text style={styles.title}>Religion</Text>
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
              <Text style={styles.religionText}>{religion.name}</Text>
            </View>
            {selectedReligion === religion.name && (
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
});
