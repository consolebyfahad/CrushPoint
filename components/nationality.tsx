import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
  onSelect,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const [searchText, setSearchText] = useState("");
  const [selectedNationality, setSelectedNationality] = useState(
    filterData.nationality || "Algerian"
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
    setSelectedNationality(nationality);
    // Save the selection and auto close after selection
    setFilterData({
      ...filterData,
      nationality: nationality,
    });
    setTimeout(() => {
      console.log("Selected nationality:", nationality);
      onSelect();
    }, 200);
  };

  const renderNationalityItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.nationalityItem}
      onPress={() => handleNationalitySelect(item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.nationalityContent}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={styles.nationalityText}>{item.name}</Text>
      </View>
      {selectedNationality === item.name && (
        <Ionicons name="checkmark" size={20} color="#5FB3D4" />
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
        <Text style={styles.title}>Nationality</Text>
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
            color={color.gray400}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search nationality"
            placeholderTextColor={color.gray400}
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
});
