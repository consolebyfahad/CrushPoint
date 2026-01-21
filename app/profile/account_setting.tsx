import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function AccountSettings() {
  const { t } = useTranslation();
  const { user, updateUserData, userData, logout } = useAppContext();
  const { showToast } = useToast();
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

  // Get change dates from userData
  const nameChangeDate = (userData as any)?.name_change_date || null;
  const dobChangeDate = (userData as any)?.dob_change_date || null;

  // Check if 60 days have passed since last change
  const canEditNameOrDob = (
    changeDate: string | null,
    fieldType: "name" | "dob"
  ) => {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    if (!changeDate) {
      // If no change date, allow editing (first time or never changed)
      return true;
    }

    try {
      // Parse the change date (assuming YYYY-MM-DD format)
      const lastChangeDate = new Date(changeDate);
      lastChangeDate.setHours(0, 0, 0, 0); // Reset time to start of day

      // Check if date is valid
      if (isNaN(lastChangeDate.getTime())) {
        return true; // If invalid date, allow editing
      }

      // Calculate difference in days
      const diffTime = today.getTime() - lastChangeDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Check if less than 60 days
      return diffDays >= 60;
    } catch (error) {

      return true; // On error, allow editing
    }
  };

  const canEditName = canEditNameOrDob(nameChangeDate, "name");
  const canEditDob = canEditNameOrDob(dobChangeDate, "dob");

  // Load existing user data when component mounts
  useEffect(() => {
    if (userData) {

      try {
        const userProfile = userData;

        setAccountData({
          fullName: userData.name || "",
          dateOfBirth: userData.dob || "",
          phoneNumber: userData.phone || "",
          email: userData.email || "",
        });

        // Set date picker date if DOB exists
        if (userProfile.dob) {
          try {
            // Assuming DOB is in mm/dd/yyyy format
            const [month, day, year] = userProfile.dob.split("/");
            const dateObj = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );
            setDate(dateObj);
          } catch (error) {

          }
        }
      } catch (error) {

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

  // Check if field can be edited (only if empty)
  const canEditField = (field: string) => {
    if (field === "phoneNumber") {
      return !userData?.phone || userData.phone.trim() === "";
    }
    if (field === "email") {
      return !userData?.email || userData.email.trim() === "";
    }
    return true;
  };

  const validateFields = () => {
    if (!accountData.fullName.trim()) {
      Alert.alert(
        t("validation.validationError"),
        t("validation.enterFullName")
      );
      return false;
    }

    if (!accountData.dateOfBirth.trim()) {
      Alert.alert(
        t("validation.validationError"),
        t("validation.selectDateOfBirth")
      );
      return false;
    }

    // Only validate phone number if it can be edited (empty) or if it has a value
    if (canEditField("phoneNumber")) {
      if (!accountData.phoneNumber.trim()) {
        Alert.alert(
          t("validation.validationError"),
          t("validation.enterPhoneNumber")
        );
        return false;
      }

      if (!validatePhoneNumber(accountData.phoneNumber)) {
        Alert.alert(
          t("validation.validationError"),
          t("validation.enterValidPhoneNumber")
        );
        return false;
      }
    }

    // Only validate email if it can be edited (empty) or if it has a value
    if (canEditField("email")) {
      if (!accountData.email.trim()) {
        Alert.alert(
          t("validation.validationError"),
          t("validation.enterEmailAddress")
        );
        return false;
      }

      if (!validateEmail(accountData.email)) {
        Alert.alert(
          t("validation.validationError"),
          t("validation.enterValidEmailAddress")
        );
        return false;
      }
    }

    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    // Prevent editing if field already has a value
    if (field === "phoneNumber" && !canEditField(field)) {
      return;
    }
    if (field === "email" && !canEditField(field)) {
      return;
    }

    setAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsChanged(true);
  };
  const nameChangeCount = (userData as any)?.name_change_count || "0";
  const dobChangeCount = (userData as any)?.dob_change_count || "0";

  const handleSaveChanges = async () => {
    if (!user?.user_id) {
      Alert.alert(t("common.error"), t("validation.userSessionExpired"));
      return;
    }

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    try {
      // Check if name or DOB changed
      const nameChanged =
        accountData.fullName.trim() !== (userData?.name || "");
      const dobChanged = accountData.dateOfBirth !== (userData?.dob || "");

      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const currentDate = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");
      formData.append("name", accountData.fullName.trim());
      formData.append("dob", accountData.dateOfBirth);
      formData.append("date", currentDate);

      // Only send name_change_count if name was changed
      if (nameChanged) {
        formData.append("name_change_count", nameChangeCount);
      }

      // Only send dob_change_count if DOB was changed
      if (dobChanged) {
        formData.append("dob_change_count", dobChangeCount);
      }

      // Only update phone if it can be edited
      if (canEditField("phoneNumber")) {
        formData.append("phone", accountData.phoneNumber.trim());
      }

      // Only update email if it can be edited
      if (canEditField("email")) {
        formData.append("email", accountData.email.trim().toLowerCase());
      }

      const response = await apiCall(formData);

      if (response.result) {
        // Update context with new data (only editable fields)
        const updatedData: any = {
          name: accountData.fullName.trim(),
          dob: accountData.dateOfBirth,
        };

        if (canEditField("phoneNumber")) {
          updatedData.phone = accountData.phoneNumber.trim();
        }

        if (canEditField("email")) {
          updatedData.email = accountData.email.trim().toLowerCase();
        }

        updateUserData(updatedData);

        setIsChanged(false);

        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        showToast(t("account.failedToUpdateSettings"), "error");
      }
    } catch (error) {
      showToast(t("validation.failedToUpdateSettings"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("account.deleteAccount"),
      t("profile.deleteAccountConfirmation"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            if (!user?.user_id) {
              Alert.alert(
                t("common.error"),
                t("validation.userSessionExpired")
              );
              return;
            }

            setIsLoading(true);
            try {
              const formData = new FormData();
              formData.append("type", "delete_account");
              formData.append("user_id", user.user_id);

              const response = await apiCall(formData);

              if (response.result) {
                showToast(t("account.accountDeletedSuccessfully"), "success");

                // Clear user data and logout
                setTimeout(async () => {
                  await logout();
                  router.replace("/auth/login");
                }, 1500);
              } else {
                showToast(
                  response.message || t("account.failedToDeleteAccount"),
                  "error"
                );
              }
            } catch (error) {

              showToast(t("account.failedToDeleteAccount"), "error");
            } finally {
              setIsLoading(false);
            }
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
      <Header title={t("profile.accountSettings")} divider={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Full Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.fullName")}</Text>
          <TextInput
            style={[styles.textInput, !canEditName && styles.disabledInput]}
            value={accountData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
            placeholder={t("profile.enterFullName")}
            placeholderTextColor={color.gray69}
            editable={!isLoading && canEditName}
          />
          <Text style={styles.fieldNote}>
            {t("profile.changeableOnceIn6Months")}
          </Text>
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.dateOfBirth")}</Text>
          <TouchableOpacity
            style={[
              styles.dateInput,
              (isLoading || !canEditDob) && { opacity: 0.6 },
            ]}
            onPress={handleDatePress}
            activeOpacity={0.7}
            disabled={isLoading || !canEditDob}
          >
            <TextInput
              style={[
                styles.dateTextInput,
                Platform.OS === "ios" && { paddingVertical: 16 },
                !canEditDob && styles.disabledInput,
              ]}
              value={accountData.dateOfBirth}
              placeholder={t("profile.dateFormat")}
              placeholderTextColor={color.gray69}
              editable={false}
            />
            <Ionicons name="calendar-outline" size={20} color={color.gray14} />
          </TouchableOpacity>
          {showDatePicker && canEditDob && (
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
          <Text style={styles.fieldNote}>
            {t("profile.changeableOnceIn6Months")}
          </Text>
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.phoneNumber")}</Text>
          <TextInput
            style={[
              styles.textInput,
              !canEditField("phoneNumber") && styles.disabledInput,
            ]}
            value={accountData.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            placeholder={t("profile.enterPhoneNumber")}
            placeholderTextColor={color.gray69}
            keyboardType="phone-pad"
            editable={!isLoading && canEditField("phoneNumber")}
          />
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.email")}</Text>
          <TextInput
            style={[
              styles.textInput,
              !canEditField("email") && styles.disabledInput,
            ]}
            value={accountData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder={t("profile.enterEmail")}
            placeholderTextColor={color.gray69}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading && canEditField("email")}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <CustomButton
          title={t("account.deleteMyAccount")}
          variant="secondary"
          style={{ borderColor: color.error }}
          fontstyle={{ color: color.error }}
          onPress={handleDeleteAccount}
          isDisabled={isLoading}
        />
        <CustomButton
          title={
            isLoading ? t("validation.saving") : t("validation.saveChanges")
          }
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
  disabledInput: {
    backgroundColor: color.gray97,
    color: color.black,
    opacity: 0.6,
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
    fontSize: 12,
    fontFamily: font.regular,
    color: color.error,
    marginTop: 4,
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
