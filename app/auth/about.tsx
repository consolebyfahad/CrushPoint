import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import Octicons from "@expo/vector-icons/Octicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
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
  const { updateUserData } = useAppContext();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleContinue = () => {
    updateUserData({ name: name, dob: dateOfBirth });
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

      // Format date as mm/dd/yyyy
      const formattedDate = `${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${currentDate.getFullYear()}`;
      setDateOfBirth(formattedDate);
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.disclaimerText}>
              <Octicons name="info" size={14} color={color.gray55} />{" "}
              {"We don't display your age publicly without your consent"}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={[
                styles.input,
                Platform.OS === "ios" && { paddingVertical: 14 },
              ]}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              onPress={handleDatePress}
              style={styles.dateInput}
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
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.confirmButton}>Done</Text>
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
          title="Continue"
          onPress={handleContinue}
          isDisabled={!name.trim() || !dateOfBirth.trim()}
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
