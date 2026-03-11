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

  const nameChangeDate = (userData as any)?.name_change_date || null;
  const dobChangeDate = (userData as any)?.dob_change_date || null;

  const canEditNameOrDob = (
    changeDate: string | null,
    fieldType: "name" | "dob"
  ) => {
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);  

    if (!changeDate) {
      
      return true;
    }

    try {
      
      const lastChangeDate = new Date(changeDate);
      lastChangeDate.setHours(0, 0, 0, 0);  

      if (isNaN(lastChangeDate.getTime())) {
        return true;  
      }

      const diffTime = today.getTime() - lastChangeDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= 60;
    } catch (error) {

      return true;  
    }
  };

  const canEditName = canEditNameOrDob(nameChangeDate, "name");
  const canEditDob = canEditNameOrDob(dobChangeDate, "dob");

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

        if (userProfile.dob) {
          try {
            
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
    
    const phoneRegex = /^[\+]?[1-9][\d\-\s\(\)]{7,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
  };

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
      
      const nameChanged =
        accountData.fullName.trim() !== (userData?.name || "");
      const dobChanged = accountData.dateOfBirth !== (userData?.dob || "");

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

      if (nameChanged) {
        formData.append("name_change_count", nameChangeCount);
      }

      if (dobChanged) {
        formData.append("dob_change_count", dobChangeCount);
      }

      if (canEditField("phoneNumber")) {
        formData.append("phone", accountData.phoneNumber.trim());
      }

      if (canEditField("email")) {
        formData.append("email", accountData.email.trim().toLowerCase());
      }

      const response = await apiCall(formData);

      if (response.result) {
        
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
      {}
      <Header title={t("profile.accountSettings")} divider={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {}
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

        {}
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

        {}
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

        {}
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

        {}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {}
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
