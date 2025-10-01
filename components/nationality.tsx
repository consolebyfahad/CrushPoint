import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Nationality({
  onClose,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>(
    Array.isArray(filterData.nationality) ? filterData.nationality : []
  );

  const nationalities = [
    { id: "afghan", name: "Afghan", flag: "🇦🇫" },
    { id: "albanian", name: "Albanian", flag: "🇦🇱" },
    { id: "algerian", name: "Algerian", flag: "🇩🇿" },
    { id: "american", name: "American", flag: "🇺🇸" },
    { id: "andorran", name: "Andorran", flag: "🇦🇩" },
    { id: "angolan", name: "Angolan", flag: "🇦🇴" },
    { id: "antiguan", name: "Antiguan", flag: "🇦🇬" },
    { id: "argentine", name: "Argentine", flag: "🇦🇷" },
    { id: "armenian", name: "Armenian", flag: "🇦🇲" },
    { id: "australian", name: "Australian", flag: "🇦🇺" },
    { id: "austrian", name: "Austrian", flag: "🇦🇹" },
    { id: "azerbaijani", name: "Azerbaijani", flag: "🇦🇿" },
    { id: "bahamian", name: "Bahamian", flag: "🇧🇸" },
    { id: "bahraini", name: "Bahraini", flag: "🇧🇭" },
    { id: "bangladeshi", name: "Bangladeshi", flag: "🇧🇩" },
    { id: "barbadian", name: "Barbadian", flag: "🇧🇧" },
    { id: "belarusian", name: "Belarusian", flag: "🇧🇾" },
    { id: "belgian", name: "Belgian", flag: "🇧🇪" },
    { id: "belizean", name: "Belizean", flag: "🇧🇿" },
    { id: "beninese", name: "Beninese", flag: "🇧🇯" },
  ];

  const filteredNationalities = nationalities.filter((nationality) =>
    nationality.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleNationalitySelect = (nationality: string) => {
    setSelectedNationalities((prev) => {
      if (prev.includes(nationality)) {
        // Remove nationality if already selected
        return prev.filter((n) => n !== nationality);
      } else {
        // Add nationality if not selected
        return [...prev, nationality];
      }
    });
  };

  const handleSave = () => {
    setFilterData({
      ...filterData,
      nationality: selectedNationalities,
    });
    console.log("Selected nationalities:", selectedNationalities);
    onClose();
  };

  // Check if nationality is selected
  const isSelected = (nationality: string) => {
    return selectedNationalities.includes(nationality);
  };

  const renderNationalityItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.nationalityItem,
        isSelected(item.name) && styles.selectedNationalityItem,
      ]}
      onPress={() => handleNationalitySelect(item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.nationalityContent}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text
          style={[
            styles.nationalityText,
            isSelected(item.name) && styles.selectedNationalityText,
          ]}
        >
          {item.name}
        </Text>
      </View>
      {isSelected(item.name) && (
        <Ionicons name="checkmark" size={20} color={color.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("filters.nationality")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={color.gray14}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t("filters.searchNationality")}
            placeholderTextColor={color.gray14}
          />
        </View>
      </View>

      {/* Nationality List */}
      <FlatList
        data={filteredNationalities}
        renderItem={renderNationalityItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedNationalities.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={selectedNationalities.length === 0}
        >
          <Text
            style={[
              styles.saveButtonText,
              selectedNationalities.length === 0 &&
                styles.saveButtonTextDisabled,
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
    minHeight: SCREEN_HEIGHT * 0.85,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  nationalityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  nationalityContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 16,
  },
  nationalityText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 52, // Aligns with text after flag
  },
  selectedNationalityItem: {
    backgroundColor: "#F0F9FF",
  },
  selectedNationalityText: {
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
