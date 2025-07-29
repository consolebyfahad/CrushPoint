import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
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

interface RequestMeetupProps {
  onClose: () => void;
  onSubmit: (meetupData: any) => void;
  matchData: {
    id: string;
    name: string;
    image?: string;
    distance?: string;
    matchedTime?: string;
  };
}

export default function RequestMeetup({
  onClose,
  onSubmit,
  matchData,
}: RequestMeetupProps) {
  const { user } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [location, setLocation] = useState("");
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
      setSelectedDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location for the meetup.");
      return;
    }

    if (!user?.user_id) {
      Alert.alert("Error", "User session expired. Please login again.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("user_id", user.user_id);
      formData.append("table_name", "meetup_requests");
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const formattedTime = selectedTime.toTimeString().split(" ")[0];
      formData.append("match_id", matchData.id);
      formData.append("date", formattedDate);
      formData.append("time", formattedTime);
      formData.append("location", location.trim());
      formData.append("message", message.trim());

      console.log("📡 Sending meetup request:", {
        user_id: user.user_id,
        match_id: matchData.id,
        date: formattedDate,
        time: formattedTime,
        location: location.trim(),
        message: message.trim(),
      });

      const response = await apiCall(formData);

      if (response.result) {
        Alert.alert("Success", `Meetup request sent to ${matchData.name}!`, [
          {
            text: "OK",
            onPress: () => {
              onSubmit({
                matchId: matchData.id,
                date: formattedDate,
                time: formattedTime,
                location: location.trim(),
                message: message.trim(),
              });
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to send meetup request. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Meetup request error:", error);
      Alert.alert(
        "Error",
        "Failed to send meetup request. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getImageSource = () => {
    if (matchData?.image) {
      return { uri: matchData.image };
    }
    return undefined;
  };

  const imageSource = getImageSource();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Request Meetup</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            {imageSource ? (
              <Image source={imageSource} style={styles.userImage} />
            ) : (
              <View style={[styles.userImage, styles.placeholderImage]}>
                <Ionicons name="person" size={24} color={color.gray55} />
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.requestText}>
                Send meetup request to {matchData.name}
              </Text>
              <View style={styles.userMeta}>
                <SimpleLineIcons
                  name="location-pin"
                  size={12}
                  color={color.gray55}
                />
                <Text style={styles.metaText}>
                  {matchData.distance || "0.5 km"}
                </Text>
                <View style={styles.separator} />
                <Text style={styles.metaText}>
                  Matched {matchData.matchedTime || "2 hours ago"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date Field */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Date <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={color.gray55} />
          </TouchableOpacity>
        </View>

        {/* Time Field */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Time <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>{formatTime(selectedTime)}</Text>
            <Ionicons name="time-outline" size={20} color={color.gray55} />
          </TouchableOpacity>
        </View>

        {/* Location Field */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter meetup location"
            placeholderTextColor={color.gray55}
          />
        </View>

        {/* Message Field */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Message (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Add a message..."
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
            (!location.trim() || isLoading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!location.trim() || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={color.white} />
          ) : (
            <Text style={styles.submitButtonText}>Send Request</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
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
  userCard: {
    backgroundColor: color.gray94,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    flex: 1,
  },
  requestText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginLeft: 4,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.gray55,
    marginHorizontal: 8,
  },
  section: {
    marginTop: 24,
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
    fontFamily: font.regular,
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
