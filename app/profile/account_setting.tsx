import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  Platform,
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
  const [date, setDate] = useState(new Date(1994, 10, 17));
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);

    // Format date as mm/dd/yyyy
    const formattedDate = `${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${currentDate.getFullYear()}`;

    handleInputChange("dateOfBirth", formattedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title={"Account Settings"} divider={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Full Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={accountData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
            placeholder="Enter your full name"
            placeholderTextColor={color.gray14}
          />
          <Text style={styles.fieldNote}>Changeable only once in 6 months</Text>
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={handleDatePress}
            activeOpacity={0.7}
          >
            <TextInput
              style={styles.dateTextInput}
              value={accountData.dateOfBirth}
              placeholder="mm/dd/yyyy"
              placeholderTextColor={color.gray14}
              editable={false}
            />
            <Ionicons name="calendar-outline" size={20} color={color.gray14} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
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
            placeholderTextColor={color.gray14}
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
            placeholderTextColor={color.gray14}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <CustomButton
          title="Delete My Account"
          variant="secondary"
          style={{ borderColor: color.error }}
          fontstyle={{ color: color.error }}
          onPress={handleDeleteAccount}
        />
        <CustomButton title="Save Changes" onPress={handleSaveChanges} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  fieldContainer: {
    marginBottom: 16,
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
    padding: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray14,
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  dateInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: color.gray87,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTextInput: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    flex: 1,
  },
  fieldNote: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
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
});
