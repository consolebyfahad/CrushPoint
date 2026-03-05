import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export interface CustomDropdownOption {
  label: string;
  value: string;
}

type CustomDropdownProps = {
  options: CustomDropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  containerStyle?: object;
  dropdownStyle?: object;
};

export default function CustomDropdown({
  options,
  value,
  onSelect,
  placeholder,
  loading = false,
  containerStyle,
  dropdownStyle,
}: CustomDropdownProps) {
  return (
    <View
      style={[
        styles.container,
        containerStyle,
        Platform.OS === "ios" && styles.containerIos,
      ]}
    >
      <Dropdown
        data={options}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={(item) => onSelect(item?.value ?? "")}
        style={[styles.dropdown, dropdownStyle]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.listContainer}
        itemTextStyle={styles.itemTextStyle}
        renderRightIcon={() =>
          loading ? (
            <ActivityIndicator size="small" color={color.primary} />
          ) : (
            <Ionicons name="chevron-down" size={20} color={color.gray55} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  containerIos: {
    paddingVertical: 4,
  },
  dropdown: {
    backgroundColor: color.gray94,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  listContainer: {
    borderRadius: 14,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.gray600,
    marginTop: 4,
  },
  itemTextStyle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
});
