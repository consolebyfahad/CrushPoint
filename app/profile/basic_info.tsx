import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BasicInfo({ route, navigation }: any) {
  // Get initial data from route params or use defaults
  const initialData = route?.params?.basicInfo || {
    interestedIn: "Men",
    relationshipGoals: ["Serious relationship", "Friendship"],
    height: "120 cm",
    nationality: "American",
    religion: "Christianity",
    zodiacSign: "Cancer",
  };

  const [basicInfo, setBasicInfo] = useState(initialData);

  // Options for dropdowns
  const interestedInOptions = ["Men", "Women", "Everyone"];

  const relationshipGoalOptions = [
    "Serious relationship",
    "Casual dating",
    "Friendship",
    "Something casual",
    "Don't know yet",
    "Marriage",
    "Long-term relationship",
  ];

  const heightOptions = Array.from({ length: 81 }, (_, i) => `${120 + i} cm`);

  const nationalityOptions = [
    "American",
    "Canadian",
    "British",
    "Australian",
    "German",
    "French",
    "Italian",
    "Spanish",
    "Japanese",
    "Chinese",
    "Indian",
    "Brazilian",
    "Mexican",
    "Russian",
    "Korean",
  ];

  const religionOptions = [
    "Christianity",
    "Islam",
    "Judaism",
    "Hinduism",
    "Buddhism",
    "Atheist",
    "Agnostic",
    "Other",
    "Prefer not to say",
  ];

  const zodiacOptions = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      console.log("Go back");
    }
  };

  const handleSave = () => {
    console.log("Saving basic info:", basicInfo);
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

  const toggleRelationshipGoal = (goal: string) => {
    setBasicInfo((prev) => ({
      ...prev,
      relationshipGoals: prev.relationshipGoals.includes(goal)
        ? prev.relationshipGoals.filter((g) => g !== goal)
        : [...prev.relationshipGoals, goal],
    }));
  };

  const getRelationshipGoalIcon = (goal: string) => {
    switch (goal.toLowerCase()) {
      case "serious relationship":
        return "💙";
      case "friendship":
        return "🤝";
      case "casual dating":
        return "😊";
      case "marriage":
        return "💍";
      default:
        return "💫";
    }
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

  const DropdownField = ({ label, value, options, onSelect, icon }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => {
          // For demo purposes, we'll cycle through options
          const currentIndex = options.indexOf(value);
          const nextIndex = (currentIndex + 1) % options.length;
          onSelect(options[nextIndex]);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          {icon && <Text style={styles.fieldIcon}>{icon}</Text>}
          <Text style={styles.dropdownText}>{value}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={color.gray400} />
      </TouchableOpacity>
    </View>
  );

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
        <DropdownField
          label="Interested in"
          value={basicInfo.interestedIn}
          options={interestedInOptions}
          onSelect={(value: string) => updateField("interestedIn", value)}
        />

        {/* Relationship Goals */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Relationship Goals</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              // For demo, toggle between selected goals
              toggleRelationshipGoal("Marriage");
            }}
            activeOpacity={0.7}
          >
            <View style={styles.relationshipGoalsContent}>
              {basicInfo.relationshipGoals
                .slice(0, 2)
                .map((goal: string, index: number) => (
                  <View key={goal} style={styles.goalTag}>
                    <Text style={styles.goalIcon}>
                      {getRelationshipGoalIcon(goal)}
                    </Text>
                    <Text style={styles.goalText}>{goal}</Text>
                  </View>
                ))}
            </View>
            <Ionicons name="chevron-down" size={20} color={color.gray400} />
          </TouchableOpacity>
        </View>

        {/* Height */}
        <DropdownField
          label="Height (cm)"
          value={basicInfo.height}
          options={heightOptions}
          onSelect={(value: string) => updateField("height", value)}
        />

        {/* Nationality */}
        <DropdownField
          label="Nationality"
          value={basicInfo.nationality}
          options={nationalityOptions}
          onSelect={(value: string) => updateField("nationality", value)}
          icon="🇺🇸"
        />

        {/* Religion */}
        <DropdownField
          label="Religion"
          value={basicInfo.religion}
          options={religionOptions}
          onSelect={(value: string) => updateField("religion", value)}
          icon={getReligionIcon(basicInfo.religion)}
        />

        {/* Zodiac Sign */}
        <DropdownField
          label="Zodiac Sign"
          value={basicInfo.zodiacSign}
          options={zodiacOptions}
          onSelect={(value: string) => updateField("zodiacSign", value)}
          icon={getZodiacIcon(basicInfo.zodiacSign)}
        />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray400,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownContent: {
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
  relationshipGoalsContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
    gap: 8,
  },
  goalTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  goalIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  goalText: {
    fontSize: 12,
    fontFamily: font.medium,
    color: "#0284C7",
  },
  bottomSpacing: {
    height: 100,
  },
  saveContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: color.white,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
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
