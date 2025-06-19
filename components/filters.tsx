import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Filters({ onClose }) {
  const [selectedGender, setSelectedGender] = useState("Men");
  const [ageFrom, setAgeFrom] = useState("18");
  const [ageTo, setAgeTo] = useState("35");
  const [distance, setDistance] = useState(100);

  const genderOptions = ["Men", "Women", "All"];
  const expandableOptions = [
    "Looking for",
    "Height",
    "Nationality",
    "Religion",
    "Zodiac Sign",
  ];

  const handleReset = () => {
    setSelectedGender("Men");
    setAgeFrom("18");
    setAgeTo("35");
    setDistance(100);
  };

  const handleApply = () => {
    // Apply filters logic here
    console.log("Applying filters:", {
      gender: selectedGender,
      ageFrom,
      ageTo,
      distance,
    });
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Show me section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Show me</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderButton,
                  selectedGender === option && styles.selectedGenderButton,
                ]}
                onPress={() => setSelectedGender(option)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genderText,
                    selectedGender === option && styles.selectedGenderText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age Range section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <View style={styles.ageContainer}>
            <View style={styles.ageInputContainer}>
              <TextInput
                style={styles.ageInput}
                value={ageFrom}
                onChangeText={setAgeFrom}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <Text style={styles.ageToText}>to</Text>
            <View style={styles.ageInputContainer}>
              <TextInput
                style={styles.ageInput}
                value={ageTo}
                onChangeText={setAgeTo}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>
        </View>

        {/* Distance section */}
        <View style={styles.section}>
          <View style={styles.distanceHeader}>
            <Text style={styles.sectionTitle}>Distance</Text>
            <Text style={styles.distanceValue}>{distance} km</Text>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={200}
              value={distance}
              onValueChange={setDistance}
              step={1}
              minimumTrackTintColor="#ECECEC"
              maximumTrackTintColor="#ECECEC"
              trackStyle={{ height: 10 }}
              thumbStyle={styles.sliderThumb}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 km</Text>
              <Text style={styles.sliderLabel}>200 km</Text>
            </View>
          </View>
        </View>

        {/* Expandable options */}
        <View style={styles.section}>
          {expandableOptions.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.expandableItem,
                index === expandableOptions.length - 1 &&
                  styles.lastExpandableItem,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.expandableText}>{option}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={color.gray400}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.9,
    // maxHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    backgroundColor: color.white,
  },
  selectedGenderButton: {
    borderColor: color.primary,
    backgroundColor: "#F0F9FF",
  },
  genderText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray600,
  },
  selectedGenderText: {
    color: color.primary,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ageInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: color.white,
  },
  ageInput: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    textAlign: "center",
  },
  ageToText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray600,
  },
  distanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  distanceValue: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
  },
  sliderContainer: {
    paddingHorizontal: 4,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: color.primary,
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray400,
  },
  expandableItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastExpandableItem: {
    borderBottomWidth: 0,
  },
  expandableText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    backgroundColor: color.white,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: color.primary,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
