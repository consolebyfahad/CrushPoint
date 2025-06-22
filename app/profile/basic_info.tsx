import CustomButton from "@/components/custom_button";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BasicInfo({ route, navigation }: any) {
  // Get initial data from route params or use defaults
  const initialData = route?.params?.basicInfo || {
    interestedIn: "Men",
    relationshipGoals: ["Serious relationship", "Friendship"],
    height: "170",
    nationality: "American",
    religion: "Christianity",
    zodiacSign: "Cancer",
  };

  const [basicInfo, setBasicInfo] = useState(initialData);

  // States for dropdown pickers
  const [relationshipGoalsOpen, setRelationshipGoalsOpen] = useState(false);
  const [relationshipGoalsValue, setRelationshipGoalsValue] = useState(
    initialData.relationshipGoals
  );

  // Options for dropdowns
  const interestedInOptions = [
    { label: "Men", value: "Men" },
    { label: "Women", value: "Women" },
    { label: "Both", value: "Both" },
  ];

  const relationshipGoalOptions = [
    { label: "Serious relationship", value: "Serious relationship" },
    { label: "Casual dating", value: "Casual dating" },
    { label: "Friendship", value: "Friendship" },
    { label: "Something casual", value: "Something casual" },
    { label: "Don't know yet", value: "Don't know yet" },
    { label: "Marriage", value: "Marriage" },
    { label: "Long-term relationship", value: "Long-term relationship" },
  ];

  const nationalityOptions = [
    { label: "American", value: "American" },
    { label: "Canadian", value: "Canadian" },
    { label: "British", value: "British" },
    { label: "Australian", value: "Australian" },
    { label: "German", value: "German" },
    { label: "French", value: "French" },
    { label: "Italian", value: "Italian" },
    { label: "Spanish", value: "Spanish" },
    { label: "Japanese", value: "Japanese" },
    { label: "Chinese", value: "Chinese" },
    { label: "Indian", value: "Indian" },
    { label: "Brazilian", value: "Brazilian" },
    { label: "Mexican", value: "Mexican" },
    { label: "Russian", value: "Russian" },
    { label: "Korean", value: "Korean" },
  ];

  const religionOptions = [
    { label: "Christianity", value: "Christianity" },
    { label: "Islam", value: "Islam" },
    { label: "Judaism", value: "Judaism" },
    { label: "Hinduism", value: "Hinduism" },
    { label: "Buddhism", value: "Buddhism" },
    { label: "Atheist", value: "Atheist" },
    { label: "Agnostic", value: "Agnostic" },
    { label: "Other", value: "Other" },
    { label: "Prefer not to say", value: "Prefer not to say" },
  ];

  const zodiacOptions = [
    { label: "Aries", value: "Aries" },
    { label: "Taurus", value: "Taurus" },
    { label: "Gemini", value: "Gemini" },
    { label: "Cancer", value: "Cancer" },
    { label: "Leo", value: "Leo" },
    { label: "Virgo", value: "Virgo" },
    { label: "Libra", value: "Libra" },
    { label: "Scorpio", value: "Scorpio" },
    { label: "Sagittarius", value: "Sagittarius" },
    { label: "Capricorn", value: "Capricorn" },
    { label: "Aquarius", value: "Aquarius" },
    { label: "Pisces", value: "Pisces" },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    const updatedBasicInfo = {
      ...basicInfo,
      relationshipGoals: relationshipGoalsValue,
    };
    console.log("Saving basic info:", updatedBasicInfo);
    // Save the changes to backend/storage
    // Navigate back with updated data
    if (navigation) {
      navigation.goBack();
    }
  };

  const updateField = (field: string, value: any) => {
    setBasicInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getReligionIcon = (religion: string) => {
    switch (religion.toLowerCase()) {
      case "christianity":
        return "✝️";
      case "islam":
        return "☪️";
      case "judaism":
        return "✡️";
      case "hinduism":
        return "🕉️";
      case "buddhism":
        return "☸️";
      default:
        return "🔮";
    }
  };

  const getZodiacIcon = (sign: string) => {
    const zodiacEmojis: { [key: string]: string } = {
      aries: "♈",
      taurus: "♉",
      gemini: "♊",
      cancer: "♋",
      leo: "♌",
      virgo: "♍",
      libra: "♎",
      scorpio: "♏",
      sagittarius: "♐",
      capricorn: "♑",
      aquarius: "♒",
      pisces: "♓",
    };
    return zodiacEmojis[sign.toLowerCase()] || "⭐";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Basic Info</Text>
        <View style={styles.placeholder} />
      </View>

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
              <Ionicons name="chevron-down" size={20} color={color.gray300} />
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
            renderLeftIcon={() => <Text style={styles.fieldIcon}>🇺🇸</Text>}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray300} />
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
            renderLeftIcon={() => (
              <Text style={styles.fieldIcon}>
                {getReligionIcon(basicInfo.religion)}
              </Text>
            )}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray300} />
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
            renderLeftIcon={() => (
              <Text style={styles.fieldIcon}>
                {getZodiacIcon(basicInfo.zodiacSign)}
              </Text>
            )}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray300} />
            )}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <CustomButton title="Save Changes" onPress={handleSave} />
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
    color: color.gray400,
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
