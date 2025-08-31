import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Filters({
  onClose,
  onNavigateToLookingFor,
  onNavigateToHeight,
  onNavigateToNationality,
  onNavigateToReligion,
  onNavigateToZodiac,
  filterData,
  setFilterData,
  refetch,
}: any) {
  const [selectedGender, setSelectedGender] = useState(
    filterData.gender || "Men"
  );
  const [ageFrom, setAgeFrom] = useState(filterData.ageFrom || "18");
  const [ageTo, setAgeTo] = useState(filterData.ageTo || "35");
  const [distance, setDistance] = useState(filterData.distance || 10);

  const genderOptions = ["Men", "Women", "Both"];

  // Helper function to format looking for display
  const formatLookingForDisplay = (lookingFor: any) => {
    if (!lookingFor || (Array.isArray(lookingFor) && lookingFor.length === 0)) {
      return null;
    }

    if (Array.isArray(lookingFor)) {
      if (lookingFor.length === 1) {
        return lookingFor[0];
      } else if (lookingFor.length > 1) {
        const additionalCount = lookingFor.length - 1;
        return `${lookingFor[0]} ${additionalCount}+`;
      }
    }

    // If it's a string (backward compatibility)
    return lookingFor;
  };

  const expandableOptions = [
    {
      title: "Looking for",
      hasNavigation: true,
      value: formatLookingForDisplay(filterData.lookingFor),
      onPress: onNavigateToLookingFor,
    },
    // {
    //   title: "Height",
    //   hasNavigation: true,
    //   value: filterData.height
    //     ? `${filterData.height.from}-${filterData.height.to}cm`
    //     : null,
    //   onPress: onNavigateToHeight,
    // },
    {
      title: "Nationality",
      hasNavigation: true,
      value: filterData.nationality || null,
      onPress: onNavigateToNationality,
    },
    {
      title: "Religion",
      hasNavigation: true,
      value: filterData.religion || null,
      onPress: onNavigateToReligion,
    },
    {
      title: "Zodiac Sign",
      hasNavigation: true,
      value: filterData.zodiacSign || null,
      onPress: onNavigateToZodiac,
    },
  ];

  const handleReset = () => {
    setSelectedGender("Men");
    setAgeFrom("18");
    setAgeTo("35");
    setDistance(10);

    // Reset all filter data
    setFilterData({
      gender: "Men",
      ageFrom: "18",
      ageTo: "99",
      distance: 10,
      lookingFor: [],
      // height: null,
      nationality: null,
      religion: null,
      zodiacSign: null,
    });
  };

  const handleApply = () => {
    const updatedFilterData = {
      ...filterData,
      gender: selectedGender,
      ageFrom,
      ageTo,
      distance,
    };

    setFilterData(updatedFilterData);

    // setTimeout(() => {
    //   refetch();
    // }, 100);

    console.log("Applying filters:", updatedFilterData);
    onClose();
  };

  const handleExpandableItemPress = (item: any) => {
    if (item.onPress) {
      item.onPress();
    }
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
              <TouchableOpacity
                onPress={() =>
                  setAgeFrom(Math.max(18, parseInt(ageFrom) - 1).toString())
                }
              >
                <Text>-</Text>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.ageInput,
                  Platform.OS === "ios" && { paddingVertical: 12 },
                ]}
                value={ageFrom}
                onChangeText={setAgeFrom}
                keyboardType="numeric"
                maxLength={2}
              />
              <TouchableOpacity
                onPress={() =>
                  setAgeFrom(
                    Math.min(
                      parseInt(ageTo) - 1,
                      parseInt(ageFrom) + 1
                    ).toString()
                  )
                }
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.ageToText}>to</Text>
            <View style={styles.ageInputContainer}>
              <TouchableOpacity
                onPress={() =>
                  setAgeTo(Math.max(18, parseInt(ageTo) - 1).toString())
                }
              >
                <Text>-</Text>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.ageInput,
                  Platform.OS === "ios" && { paddingVertical: 12 },
                ]}
                value={ageTo}
                onChangeText={setAgeTo}
                keyboardType="numeric"
                maxLength={2}
              />
              <TouchableOpacity
                onPress={() =>
                  setAgeTo(Math.min(99, parseInt(ageTo) + 1).toString())
                }
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Distance section */}
        <View style={styles.section}>
          <View style={styles.distanceHeader}>
            <Text style={styles.sectionTitle}>
              Distance ({Math.round(distance)} km)
            </Text>
          </View>
          <View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={200}
              value={distance}
              onValueChange={setDistance}
              step={1}
              minimumTrackTintColor={color.primary}
              maximumTrackTintColor="#ECECEC"
              thumbTintColor={color.primary}
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
              key={option.title}
              style={[
                styles.expandableItem,
                index === expandableOptions.length - 1 &&
                  styles.lastExpandableItem,
              ]}
              onPress={() => handleExpandableItemPress(option)}
              activeOpacity={0.8}
            >
              <View style={styles.expandableLeft}>
                <Text style={styles.expandableText}>{option.title}</Text>
                {option.value && (
                  <Text style={styles.expandableValue}>{option.value}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={color.gray87} />
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
    minHeight: SCREEN_HEIGHT * 0.8,
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
    marginTop: 16,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 12,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 14,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.gray600,
    alignItems: "center",
  },
  selectedGenderButton: {
    borderColor: color.primary,
    backgroundColor: color.primary100,
  },
  genderText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
  },
  selectedGenderText: {
    color: color.primary,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  ageInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: color.white,
  },
  ageInput: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    textAlign: "center",
  },
  ageToText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  distanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
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
  expandableLeft: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandableText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  expandableValue: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.primary,
    marginTop: 2,
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
