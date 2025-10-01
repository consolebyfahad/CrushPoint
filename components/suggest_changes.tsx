import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { formatMeetupDate } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
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
  onSubmit: (changes: any) => void;
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
  };
}

export default function SuggestChanges({
  onClose,
  onSubmit,
  requestId,
  originalRequest,
}: SuggestChangesProps) {
  const { user } = useAppContext();
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState(new Date());
  const [newLocation, setNewLocation] = useState(originalRequest.location);
  const [message, setMessage] = useState("");
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
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNewTime(selectedTime);
    }
  };

  const handleSubmit = async () => {
    if (!newLocation.trim()) {
      Alert.alert("Error", "Please enter a new location.");
      return;
    }

    if (!user?.user_id) {
      Alert.alert("Error", "User session expired. Please login again.");
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

      console.log("📡 Suggesting changes:", {
        id: requestId,
        new_date: formattedDate,
        new_time: formattedTime,
        new_location: newLocation.trim(),
        new_message: message.trim(),
      });

      const response = await apiCall(formData);

      if (response.result) {
        Alert.alert("Success", "Changes suggested successfully!", [
          {
            text: "OK",
            onPress: () => {
              onSubmit({
                date: formattedDate,
                time: formattedTime,
                location: newLocation.trim(),
                message: message.trim(),
              });
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to suggest changes. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Suggest changes error:", error);
      Alert.alert(
        "Error",
        "Failed to suggest changes. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Suggest Changes</Text>
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
            <Text style={styles.userName}>
              {originalRequest.user.name} Suggest changes
            </Text>
            <Text style={styles.timestamp}>{originalRequest.timestamp}</Text>
          </View>
        </View>

        {/* Original Request */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Original Request:</Text>
          <View style={styles.originalDetails}>
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={color.gray55}
              />
              <Text style={styles.detailText}>{formatMeetupDate(originalRequest.date)}</Text>
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
            New Date <Text style={styles.required}>*</Text>
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
            New Time <Text style={styles.required}>*</Text>
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
            New Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            value={newLocation}
            onChangeText={setNewLocation}
            placeholder="Enter new location"
            placeholderTextColor={color.gray55}
          />
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Message (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Explain why you'd like to change..."
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
            <Text style={styles.submitButtonText}>Suggest Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={newDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={newTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
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
});
