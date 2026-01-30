import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { formatMeetupDate } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SuggestChangesProps {
  onClose: () => void;
  onSubmit?: (changes: any) => void;
  requestId: string; // Add meetup request ID
  originalRequest: {
    user: {
      name: string;
      image: string;
    };
    timestamp: string;
    date: string;
    time: string;
    location: string;
    message: string;
  };
}

export default function SuggestChanges({
  onClose,
  onSubmit,
  requestId,
  originalRequest,
}: SuggestChangesProps) {
  const { t } = useTranslation();
  const { user } = useAppContext();
  // Initialize date to current date or later
  const [newDate, setNewDate] = useState(() => {
    const now = new Date();
    return now;
  });
  // Initialize time to 12:00 PM (noon) as a reasonable default
  const [newTime, setNewTime] = useState(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0); // Default to 12:00 PM
    return now;
  });
  const [newLocation, setNewLocation] = useState(originalRequest.location);
  const [message, setMessage] = useState(originalRequest.message);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      // Create a new Date object to ensure React detects the state change
      setNewDate(new Date(selectedDate));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    // On iOS spinner, don't close immediately - only update the time
    if (Platform.OS === "ios") {
      // Always update the time when it changes while scrolling
      // The onChange event fires continuously as user scrolls in spinner mode
      if (selectedTime) {
        setNewTime(new Date(selectedTime)); // Create new Date object to ensure state update
      }
      // Don't close on regular changes - only close if user dismissed
      // The picker will stay open until user taps Done or Cancel
    } else {
      // On Android, close immediately
      setShowTimePicker(false);
      if (selectedTime) {
        setNewTime(selectedTime);
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
    Keyboard.dismiss();
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    Keyboard.dismiss();
  };

  const handleTimeConfirm = () => {
    setShowTimePicker(false);
    Keyboard.dismiss();
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!newLocation.trim()) {
      Alert.alert(
        t("suggestChanges.error"),
        t("suggestChanges.enterNewLocation")
      );
      return;
    }

    if (!user?.user_id) {
      Alert.alert(
        t("suggestChanges.error"),
        t("suggestChanges.userSessionExpired")
      );
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", requestId);
      formData.append("table_name", "meetup_requests");

      // Format date for API (YYYY-MM-DD)
      const formattedDate = newDate.toISOString().split("T")[0];

      // Format time for API (HH:MM:SS)
      const formattedTime = newTime.toTimeString().split(" ")[0];

      formData.append("new_date", formattedDate);
      formData.append("new_time", formattedTime);
      formData.append("new_location", newLocation.trim());
      formData.append("new_message", message.trim());
      const response = await apiCall(formData);

      if (response.result) {
        onClose();
        // Alert.alert(
        //   t("suggestChanges.success"),
        //   t("suggestChanges.changesSuggestedSuccessfully"),
        //   [
        //     {
        //       text: t("suggestChanges.ok"),
        //       onPress: () => {
        //         onSubmit({
        //           date: formattedDate,
        //           time: formattedTime,
        //           location: newLocation.trim(),
        //           message: message.trim(),
        //         });
        //         onClose();
        //       },
        //     },
        //   ]
        // );
      } else {
        Alert.alert(
          t("suggestChanges.error"),
          response.message || t("suggestChanges.failedToSuggestChanges")
        );
      }
    } catch (error) {

      Alert.alert(
        t("suggestChanges.error"),
        t("suggestChanges.failedToSuggestChangesNetwork")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("suggestChanges.title")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image
            source={{ uri: originalRequest.user.image }}
            style={styles.userImage}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{originalRequest.user.name}</Text>
            <Text style={styles.timestamp}>{originalRequest.timestamp}</Text>
          </View>
        </View>

        {/* Original Request */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("suggestChanges.originalRequest")}
          </Text>
          <View style={styles.originalDetails}>
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={color.gray55}
              />
              <Text style={styles.detailText}>
                {formatMeetupDate(originalRequest.date)}
              </Text>
              <Ionicons
                name="time-outline"
                size={16}
                color={color.gray55}
                style={styles.timeIcon}
              />
              <Text style={styles.detailText}>{originalRequest.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={color.gray55}
              />
              <Text style={styles.detailText}>{originalRequest.location}</Text>
            </View>
          </View>
        </View>

        {/* New Date */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            {t("suggestChanges.newDate")}{" "}
            <Text style={styles.required}>{t("suggestChanges.required")}</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>{formatDate(newDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={color.gray55} />
          </TouchableOpacity>
        </View>

        {/* New Time */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            {t("suggestChanges.newTime")}{" "}
            <Text style={styles.required}>{t("suggestChanges.required")}</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>{formatTime(newTime)}</Text>
            <Ionicons name="time-outline" size={20} color={color.gray55} />
          </TouchableOpacity>
        </View>

        {/* New Location */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            {t("suggestChanges.newLocation")}{" "}
            <Text style={styles.required}>{t("suggestChanges.required")}</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            value={newLocation}
            onChangeText={setNewLocation}
            placeholder={t("suggestChanges.locationPlaceholder")}
            placeholderTextColor={color.gray55}
          />
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>{t("suggestChanges.message")}</Text>
          <TextInput
            style={[styles.textInput, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder={t("suggestChanges.messagePlaceholder")}
            placeholderTextColor={color.gray55}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomButton}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!newLocation.trim() || isLoading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!newLocation.trim() || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={color.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {t("suggestChanges.suggestChanges")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Android Date Picker */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={newDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* iOS Date Picker - Custom Overlay (not Modal to avoid nested modals) */}
      {Platform.OS === "ios" && showDatePicker && (
        <View style={styles.customModalOverlay}>
          <TouchableOpacity
            style={styles.customModalBackground}
            activeOpacity={1}
            onPress={handleDateCancel}
          />
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={handleDateCancel}>
                <Text style={styles.cancelButton}>{t("cancel")}</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>
                {t("suggestChanges.newDate")}
              </Text>
              <TouchableOpacity onPress={handleDateConfirm}>
                <Text style={styles.confirmButton}>{t("done")}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              testID="datePicker"
              value={newDate}
              mode="date"
              display="spinner"
              themeVariant="light"
              onChange={handleDateChange}
              minimumDate={new Date()}
              style={styles.datePicker}
              locale="en_US"
              textColor={color.black}
            />
          </View>
        </View>
      )}

      {/* Android Time Picker */}
      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={newTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          themeVariant="light"
        />
      )}

      {/* iOS Time Picker - Custom Overlay (not Modal to avoid nested modals) */}
      {Platform.OS === "ios" && showTimePicker && (
        <View style={styles.customModalOverlay}>
          <TouchableOpacity
            style={styles.customModalBackground}
            activeOpacity={1}
            onPress={handleTimeCancel}
          />
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={handleTimeCancel}>
                <Text style={styles.cancelButton}>{t("cancel")}</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>
                {t("suggestChanges.newTime")}
              </Text>
              <TouchableOpacity onPress={handleTimeConfirm}>
                <Text style={styles.confirmButton}>{t("done")}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              testID="timePicker"
              value={newTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              style={styles.datePicker}
              locale="en_US"
              textColor={color.black}
              themeVariant="light"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
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
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray94,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 12,
  },
  originalDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  timeIcon: {
    marginLeft: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  dateTimeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: color.gray94,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: color.white,
  },
  dateTimeText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  textInput: {
    borderWidth: 1,
    borderColor: color.gray94,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    backgroundColor: color.white,
  },
  messageInput: {
    height: 100,
    paddingTop: 14,
  },
  bottomButton: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  submitButton: {
    backgroundColor: color.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: color.gray94,
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
  // Custom modal overlay using absolute positioning (not React Native Modal)
  // This avoids nested modal issues on iOS
  customModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  customModalBackground: {
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
    zIndex: 1001,
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
