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
import DropDownPicker from "react-native-dropdown-picker";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BasicInfo() {
  const { user } = useAppContext();
  console.log(user?.user_id);
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  console.log("params", params);
  const initialData = {
    interestedIn: params.interestedIn || "Male",
    relationshipGoals: params.relationshipGoals
      ? JSON.parse(params.relationshipGoals as string)
      : [],
    height: params.height || "170",
    nationality: params.nationality || "American",
    religion: params.religion || "Christianity",
    zodiacSign: params.zodiacSign || "Cancer",
  };
  console.log(initialData.relationshipGoals);
  const [basicInfo, setBasicInfo] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // States for dropdown pickers
  const [relationshipGoalsOpen, setRelationshipGoalsOpen] = useState(false);
  const [relationshipGoalsValue, setRelationshipGoalsValue] = useState(
    initialData.relationshipGoals
  );

  // Options for dropdowns
  const interestedInOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Both", value: "both" },
  ];

  const relationshipGoalOptions = [
    { label: "🩵 Serious relationship", value: "🩵 Serious relationship" },
    { label: "😘 Casual dating", value: "😘 Casual dating" },
    { label: "🤝 Friendship", value: "🤝 Friendship" },
    { label: "🔥 Open to possibilities", value: "🔥 Open to possibilities" },
    { label: "🤫 Prefer not to say", value: "🤫 Prefer not to say" },
  ];

  const validateFields = () => {
    if (!basicInfo.interestedIn) {
      Alert.alert(
        "Validation Error",
        "Please select what you're interested in."
      );
      return false;
    }

    if (!relationshipGoalsValue || relationshipGoalsValue.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please select at least one relationship goal."
      );
      return false;
    }

    if (!basicInfo.height || isNaN(Number(basicInfo.height))) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid height in centimeters."
      );
      return false;
    }

    if (!basicInfo.nationality) {
      Alert.alert("Validation Error", "Please select your nationality.");
      return false;
    }

    if (!basicInfo.religion) {
      Alert.alert("Validation Error", "Please select your religion.");
      return false;
    }

    if (!basicInfo.zodiacSign) {
      Alert.alert("Validation Error", "Please select your zodiac sign.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!user?.user_id) {
      Alert.alert("Error", "User session expired. Please login again.");
      return;
    }

    if (!validateFields()) {
      return;
    }

    const updatedBasicInfo = {
      ...basicInfo,
      relationshipGoals: relationshipGoalsValue,
    };

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");

      // Append all basic info fields
      formData.append("gender_interest", updatedBasicInfo.interestedIn);
      formData.append(
        "looking_for",
        JSON.stringify(updatedBasicInfo.relationshipGoals)
      );
      formData.append("height", updatedBasicInfo.height);
      formData.append("nationality", updatedBasicInfo.nationality);
      formData.append("religion", updatedBasicInfo.religion);
      formData.append("zodiac", updatedBasicInfo.zodiacSign);

      const response = await apiCall(formData);

      if (response.result) {
        showToast("Basic information updated successfully!");
        router.back();
      } else {
        showToast(response.message || "Failed to update basic information");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert(
        "Error",
        "Failed to update basic information. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: any, value: any) => {
    setBasicInfo((prev: any) => ({
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
            style={styles.dropdown}
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

        {/* Relationship Goals - Multi Select */}
        <View style={[styles.fieldContainer, { zIndex: 9 }]}>
          <Text style={styles.fieldLabel}>Relationship Goals</Text>
          <DropDownPicker
            open={relationshipGoalsOpen}
            value={relationshipGoalsValue}
            items={relationshipGoalOptions}
            setOpen={setRelationshipGoalsOpen}
            setValue={setRelationshipGoalsValue}
            multiple={true}
            mode="BADGE"
            badgeDotColors={[
              "#e76f51",
              "#00b4d8",
              "#0077b6",
              "#90e0ef",
              "#00f5ff",
            ]}
            style={styles.multiSelectDropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            textStyle={styles.dropdownTextStyle}
            placeholder="Select relationship goals"
            searchable={false}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
          />
        </View>

        {/* Height - Text Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput
            style={styles.textInput}
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
            style={styles.dropdown}
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
            style={styles.dropdown}
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
            style={styles.dropdown}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
  dropdownLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    flex: 1,
  },
  // Multi-select dropdown styles
  multiSelectDropdown: {
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    // backgroundColor: color.white,
    minHeight: 50,
    zIndex: 9,
  },
  dropDownContainer: {
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 9,
  },
  dropdownTextStyle: {
    fontSize: 16,
    // backgroundColor: color.white,
    fontFamily: font.medium,
    color: color.black,
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
  },
  saveButton: {
    backgroundColor: "#5FB3D4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
