import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountSettings({ route, navigation }: any) {
  const [accountData, setAccountData] = useState({
    fullName: "Julia Williams",
    dateOfBirth: "11/17/1994",
    phoneNumber: "+1 316 322 0000",
    email: "Email@example.com",
  });

  const [isChanged, setIsChanged] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: string, value: string) => {
    setAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsChanged(true);
  };

  const handleSaveChanges = () => {
    console.log("Saving account changes:", accountData);
    // Save changes to backend
    setIsChanged(false);

    // Show success message
    Alert.alert(
      "Success",
      "Your account settings have been updated successfully.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Account deletion confirmed");
            // Handle account deletion
          },
        },
      ]
    );
  };

  const openDatePicker = () => {
    console.log("Open date picker");
    // For demo, we'll just cycle through some sample dates
    const sampleDates = ["11/17/1994", "05/22/1992", "03/15/1996"];
    const currentIndex = sampleDates.indexOf(accountData.dateOfBirth);
    const nextIndex = (currentIndex + 1) % sampleDates.length;
    handleInputChange("dateOfBirth", sampleDates[nextIndex]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Full Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={accountData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
            placeholder="Enter your full name"
            placeholderTextColor={color.gray400}
          />
          <Text style={styles.fieldNote}>Changeable only once in 6 months</Text>
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={openDatePicker}
            activeOpacity={0.7}
          >
            <Text style={styles.dateText}>{accountData.dateOfBirth}</Text>
            <Ionicons name="calendar-outline" size={20} color={color.gray400} />
          </TouchableOpacity>
          <Text style={styles.fieldNote}>Changeable only once in 6 months</Text>
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={accountData.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            placeholder="Enter your phone number"
            placeholderTextColor={color.gray400}
            keyboardType="phone-pad"
          />
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={accountData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Enter your email"
            placeholderTextColor={color.gray400}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete My Account</Text>
        </TouchableOpacity>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.saveButton, !isChanged && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          activeOpacity={0.8}
          disabled={!isChanged}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginTop: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray400,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  fieldNote: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray400,
    marginTop: 8,
  },
  bottomSpacing: {
    height: 150,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: color.white,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    gap: 12,
  },
  deleteButton: {
    backgroundColor: color.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: "#EF4444",
  },
  saveButton: {
    backgroundColor: "#5FB3D4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: color.gray400,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
