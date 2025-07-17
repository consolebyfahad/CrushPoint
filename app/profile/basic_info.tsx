import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import {
  nationalityOptions,
  religionOptions,
  zodiacOptions,
} from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BasicInfo() {
  const { user, userData, updateUserData } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  console.log("params", params);

  // Initialize state properly from params
  const [basicInfo, setBasicInfo] = useState({
    interestedIn: userData.gender_interest || "",
    height: userData.height || "",
    nationality: userData.nationality || "",
    religion: userData.religion || "",
    zodiacSign: userData.zodiac || "",
  });

  const [relationshipGoal, setRelationshipGoal] = useState(
    userData.originalLookingForIds?.[0] || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  // Options for dropdowns
  const interestedInOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Both", value: "both" },
  ];

  const relationshipGoalOptions = [
    { label: "🩵 Serious relationship", value: "serious" },
    { label: "😘 Casual dating", value: "casual" },
    { label: "🤝 Friendship", value: "friendship" },
    { label: "🔥 Open to possibilities", value: "open" },
    { label: "🤫 Prefer not to say", value: "prefer-not" },
  ];

  const handleSave = async () => {
    if (!user?.user_id) {
      Alert.alert("Error", "User session expired. Please login again.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");

      // Append all basic info fields
      formData.append("gender_interest", basicInfo.interestedIn);
      formData.append("looking_for", JSON.stringify([relationshipGoal]));
      formData.append("height", basicInfo.height);
      formData.append("nationality", basicInfo.nationality);
      formData.append("religion", basicInfo.religion);
      formData.append("zodiac", basicInfo.zodiacSign);

      const response = await apiCall(formData);

      if (response.result) {
        updateUserData({
          gender_interest: basicInfo.interestedIn,
          looking_for: [relationshipGoal],
          originalLookingForIds: [relationshipGoal],
          height: basicInfo.height,
          nationality: basicInfo.nationality,
          religion: basicInfo.religion,
          zodiac: basicInfo.zodiacSign,
        });
        showToast("Basic information updated successfully!");
        router.back();
      } else {
        showToast(
          response.message || "Failed to update basic information",
          "error"
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      showToast(
        "Failed to update basic information. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setBasicInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title={"Basic Info"} divider />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Interested in */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Interested in</Text>
          <Dropdown
            style={[
              styles.dropdown,
              !basicInfo.interestedIn && styles.errorBorder,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={interestedInOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select interested in"
            value={basicInfo.interestedIn}
            onChange={(item) => {
              updateField("interestedIn", item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Relationship Goal - Single Select */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Relationship Goal</Text>
          <Dropdown
            style={[styles.dropdown, !relationshipGoal && styles.errorBorder]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={relationshipGoalOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select relationship goal"
            value={relationshipGoal}
            onChange={(item) => {
              setRelationshipGoal(item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Height - Text Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput
            style={[styles.textInput, !basicInfo.height && styles.errorBorder]}
            value={basicInfo.height}
            onChangeText={(text) => updateField("height", text)}
            placeholder="Enter height in cm"
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Nationality */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Nationality</Text>
          <Dropdown
            style={[
              styles.dropdown,
              !basicInfo.nationality && styles.errorBorder,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={nationalityOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select nationality"
            value={basicInfo.nationality}
            onChange={(item) => {
              updateField("nationality", item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Religion */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Religion</Text>
          <Dropdown
            style={[styles.dropdown, !basicInfo.religion && styles.errorBorder]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={religionOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select religion"
            value={basicInfo.religion}
            onChange={(item) => {
              updateField("religion", item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Zodiac Sign */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Zodiac Sign</Text>
          <Dropdown
            style={[
              styles.dropdown,
              !basicInfo.zodiacSign && styles.errorBorder,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={zodiacOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select zodiac sign"
            value={basicInfo.zodiacSign}
            onChange={(item) => {
              updateField("zodiacSign", item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <CustomButton
          title={isLoading ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          isDisabled={isLoading}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginTop: 24,
    zIndex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray700,
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: color.white,
  },
  errorBorder: {
    borderColor: "#FF6B6B",
    borderWidth: 1.5,
  },
  placeholderStyle: {
    fontSize: 16,
    color: color.gray14,
    fontFamily: font.medium,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: color.black,
    fontFamily: font.medium,
    flex: 1,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  // Text input styles
  textInput: {
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    backgroundColor: color.white,
  },
  bottomSpacing: {
    height: 100,
  },
  saveContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
