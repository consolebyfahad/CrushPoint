import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomSearchBar({
  searchText,
  onChangeText,
  placeholder = "Search",
  containerStyle,
  inputContainerStyle,
}) {
  return (
    <View
      style={[
        styles.searchInputContainer,
        inputContainerStyle,
        Platform.OS === "ios" && { paddingVertical: 12 },
      ]}
    >
      <Feather
        name="search"
        size={20}
        color={color.gray300}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.gray300}
      />
      {searchText.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color={color.gray400} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray500,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
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
  clearButton: {
    marginLeft: 8,
  },
});
