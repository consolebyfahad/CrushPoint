import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import Octicons from "@expo/vector-icons/Octicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const About = () => {
  const { t } = useTranslation();
  const { updateUserData } = useAppContext();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [about, setAbout] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ageError, setAgeError] = useState("");

  // Dismiss keyboard when date picker is closed on Android
  useEffect(() => {
    if (Platform.OS === "android" && !showDatePicker) {
      Keyboard.dismiss();
    }
  }, [showDatePicker]);

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleContinue = () => {
    if (ageError) return; // Don't continue if there's an age error

    updateUserData({ name: name, dob: dateOfBirth, about: about });
    router.push("/auth/looking_for");
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate: any) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);

      // Check if user is 18 or older
      const age = calculateAge(currentDate);
      if (age < 18) {
        setAgeError(t("about.ageValidation"));
        setDateOfBirth("");
      } else {
        setAgeError("");
        // Format date as mm/dd/yyyy
        const formattedDate = `${(currentDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${currentDate
          .getDate()
          .toString()
          .padStart(2, "0")}/${currentDate.getFullYear()}`;
        setDateOfBirth(formattedDate);
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
    // Dismiss keyboard after date selection
    Keyboard.dismiss();
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    // Dismiss keyboard after canceling date selection
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{t("about.about")}</Text>
            <Text style={styles.disclaimerText}>
              <Octicons name="info" size={14} color={color.gray55} />{" "}
              {t("about.agePrivacyNote")}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("about.name")}</Text>
            <TextInput
              style={[
                styles.input,
                Platform.OS === "ios" && { paddingVertical: 14 },
              ]}
              placeholder={t("about.name")}
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("about.dateOfBirth")}</Text>
            <TouchableOpacity
              onPress={handleDatePress}
              style={[styles.dateInput, ageError && styles.dateInputError]}
            >
              <TextInput
                style={[
                  styles.dateTextInput,
                  Platform.OS === "ios" && { paddingVertical: 14 },
                ]}
                placeholder="mm/dd/yyyy"
                placeholderTextColor="#999"
                value={dateOfBirth}
                editable={false}
                pointerEvents="none"
              />

              <Octicons name="calendar" size={18} color={color.gray55} />
            </TouchableOpacity>
            {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("about.bio")}</Text>
            <TextInput
              style={[
                styles.bioInput,
                Platform.OS === "ios" && { paddingVertical: 14 },
              ]}
              placeholder={t("about.bioPlaceholder")}
              placeholderTextColor="#999"
              value={about}
              onChangeText={setAbout}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Android Date Picker (inline) */}
          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
              themeVariant="light"
            />
          )}
        </View>
      </TouchableWithoutFeedback>
      {/* iOS Date Picker Modal */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={styles.datePickerContainer}>
              {/* Header */}
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={handleDateCancel}>
                  <Text style={styles.cancelButton}>{t("cancel")}</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  {t("about.dateOfBirth")}
                </Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.confirmButton}>{t("done")}</Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker */}
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
                themeVariant="light"
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={t("about.continue")}
          onPress={handleContinue}
          isDisabled={!name.trim() || !dateOfBirth.trim() || !!ageError}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    paddingTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 14,
    color: color.gray55,
    lineHeight: 20,
    fontFamily: font.regular,
    letterSpacing: 0.6,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: color.gray87,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: color.black,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: color.gray87,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: color.black,
    minHeight: 100,
    maxHeight: 120,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: color.gray87,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 16,
    color: color.black,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTextInput: {
    color: color.black,
    flex: 1,
  },
  dateInputError: {
    borderColor: color.error,
  },
  errorText: {
    fontSize: 14,
    color: color.error,
    fontFamily: font.regular,
    marginTop: 8,
    marginLeft: 4,
  },
  buttonContainer: {
    borderTopWidth: 1,
    padding: 16,
    borderColor: color.gray95,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
  },
  confirmButton: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.primary,
  },
  datePicker: {
    backgroundColor: color.white,
    alignSelf: "center",
  },
});

export default About;
