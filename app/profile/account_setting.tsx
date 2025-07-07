import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const { user, userData, updateUserData } = useAppContext();

  const [accountData, setAccountData] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
  });

  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load existing user data when component mounts
  useEffect(() => {
    if (userData) {
      setAccountData({
        fullName: userData.name || "",
        dateOfBirth: userData.dob || "",
        phoneNumber: userData.phone || "",
        email: userData.email || "",
      });

      // Set date picker date if DOB exists
      if (userData.dob) {
        try {
          // Assuming DOB is in mm/dd/yyyy format
          const [month, day, year] = userData.dob.split("/");
          const dateObj = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
          setDate(dateObj);
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }
    }
  }, [userData]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    // Basic phone validation - should contain numbers and can have +, -, spaces, parentheses
    const phoneRegex = /^[\+]?[1-9][\d\-\s\(\)]{7,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
  };

  const validateFields = () => {
    if (!accountData.fullName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name.");
      return false;
    }

    if (!accountData.dateOfBirth.trim()) {
      Alert.alert("Validation Error", "Please select your date of birth.");
      return false;
    }

    if (!accountData.phoneNumber.trim()) {
      Alert.alert("Validation Error", "Please enter your phone number.");
      return false;
    }

    if (!validatePhoneNumber(accountData.phoneNumber)) {
      Alert.alert("Validation Error", "Please enter a valid phone number.");
      return false;
    }

    if (!accountData.email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address.");
      return false;
    }

    if (!validateEmail(accountData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    setAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsChanged(true);
  };

  const handleSaveChanges = async () => {
    if (!user?.user_id) {
      Alert.alert("Error", "User session expired. Please login again.");
      return;
    }

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");
      formData.append("name", accountData.fullName.trim());
      formData.append("dob", accountData.dateOfBirth);
      formData.append("phone", accountData.phoneNumber.trim());
      formData.append("email", accountData.email.trim().toLowerCase());

      console.log("Updating account data:", {
        name: accountData.fullName.trim(),
        dob: accountData.dateOfBirth,
        phone: accountData.phoneNumber.trim(),
        email: accountData.email.trim().toLowerCase(),
      });

      const response = await apiCall(formData);

      if (response.result) {
        // Update context with new data
        updateUserData({
          name: accountData.fullName.trim(),
          dob: accountData.dateOfBirth,
          phone: accountData.phoneNumber.trim(),
          email: accountData.email.trim().toLowerCase(),
        });

        setIsChanged(false);

        Alert.alert(
          "Success",
          "Your account settings have been updated successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                if (navigation) {
                  navigation.goBack();
                } else {
                  router.back();
                }
              },
            },
          ]
        );
      } else {
        throw new Error(
          response.message || "Failed to update account settings"
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert(
        "Error",
        "Failed to update account settings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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
            // TODO: Implement account deletion API call
          },
        },
      ]
    );
  };

  const handleDatePress = () => {
    setShowDatePicker(!showDatePicker);
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
            editable={!isLoading}
          />
          <Text style={styles.fieldNote}>Changeable only once in 6 months</Text>
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.dateInput, isLoading && { opacity: 0.6 }]}
            onPress={handleDatePress}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <TextInput
              style={[
                styles.dateTextInput,
                Platform.OS === "ios" && { paddingVertical: 16 },
              ]}
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
              themeVariant="light"
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
            editable={!isLoading}
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
            editable={!isLoading}
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
          isDisabled={isLoading}
        />
        <CustomButton
          title={isLoading ? "Saving..." : "Save Changes"}
          onPress={handleSaveChanges}
          isDisabled={!isChanged || isLoading}
          isLoading={isLoading}
        />
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
