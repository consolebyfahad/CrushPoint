import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import Octicons from "@expo/vector-icons/Octicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const About = () => {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleContinue = () => {
    router.push("/auth/looking_for");
    console.log("Continue pressed", { name, dateOfBirth });
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
    setDateOfBirth(formattedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Tell us about you</Text>

        <View style={styles.disclaimerContainer}>
          <Octicons name="info" size={16} color={color.gray300} />
          <Text style={styles.disclaimerText}>
            {"We don't display your age publicly without your consent"}
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Date of Birth Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={handleDatePress} style={styles.dateInput}>
            <TextInput
              style={styles.dateTextInput}
              placeholder="mm/dd/yyyy"
              placeholderTextColor="#999"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              editable={false}
            />
            <Octicons name="calendar" size={18} color={color.gray300} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue Button */}
      <CustomButton title="Continue" onPress={handleContinue} />

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()} // Prevents future dates
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  disclaimerContainer: {
    flexDirection: "row",
    // alignItems: "flex-start",
    marginBottom: 40,
    // paddingRight: 20,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  disclaimerText: {
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
    fontFamily: font.regular,
    letterSpacing: 1,
    // flex: 1,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTextInput: {},
});

export default About;
