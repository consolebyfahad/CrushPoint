import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Height({
  onClose,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const [fromHeight, setFromHeight] = useState(filterData.height?.from);
  const [toHeight, setToHeight] = useState(filterData.height?.to);

  const handleConfirm = () => {
    // Save the height range logic here
    setFilterData({
      ...filterData,
      height: {
        from: fromHeight,
        to: toHeight,
      },
    });
    console.log("Selected height range:", {
      from: fromHeight,
      to: toHeight,
    });
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Height</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* From Height */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>From (cm)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={fromHeight}
              onChangeText={setFromHeight}
              keyboardType="numeric"
              maxLength={3}
              placeholder="150"
              placeholderTextColor={color.gray200}
            />
          </View>
        </View>

        {/* To Height */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>To (cm)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={toHeight}
              onChangeText={setToHeight}
              keyboardType="numeric"
              maxLength={3}
              placeholder="180"
              placeholderTextColor={color.gray200}
            />
          </View>
        </View>
      </View>

      {/* Bottom Confirm Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
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
    minHeight: SCREEN_HEIGHT * 0.5,
    paddingBottom: 24,
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
    paddingTop: 32,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: color.white,
  },
  input: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    textAlign: "left",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  confirmButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#5FB3D4", // Teal blue color from the image
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
