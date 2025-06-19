import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const allInterests = [
  { id: "meditation", emoji: "🧘", label: "Meditation" },
  { id: "music", emoji: "🎵", label: "Music" },
  { id: "fitness", emoji: "🏋️", label: "Fitness" },
  { id: "travel", emoji: "✈️", label: "Travel" },
  { id: "food", emoji: "🍔", label: "Food" },
  { id: "books", emoji: "📚", label: "Books" },
  { id: "tech", emoji: "💻", label: "Tech" },
  { id: "art", emoji: "🎨", label: "Art" },
  { id: "pets", emoji: "🐾", label: "Pets" },
  { id: "gaming", emoji: "🎮", label: "Gaming" },
  { id: "nature", emoji: "🌿", label: "Nature" },
  { id: "movies", emoji: "🎬", label: "Movies" },
  { id: "photography", emoji: "📸", label: "Photography" },
  { id: "cooking", emoji: "🍳", label: "Cooking" },
  { id: "dancing", emoji: "💃", label: "Dancing" },
  { id: "writing", emoji: "✍️", label: "Writing" },
  { id: "sports", emoji: "⚽", label: "Sports" },
  { id: "fashion", emoji: "👗", label: "Fashion" },
  { id: "yoga", emoji: "🧘", label: "Yoga" },
  { id: "coffee", emoji: "☕", label: "Coffee" },
  { id: "wine", emoji: "🍷", label: "Wine" },
  { id: "hiking", emoji: "🥾", label: "Hiking" },
  { id: "languages", emoji: "🗣️", label: "Languages" },
  { id: "science", emoji: "🔬", label: "Science" },
];

export default function Interests() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInterests, setFilteredInterests] = useState(allInterests);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for 3 seconds
    const newTimeout = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setFilteredInterests(allInterests);
      } else {
        const filtered = allInterests.filter((interest) =>
          interest.label.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
        setFilteredInterests(filtered);
      }
    }, 3000);

    setSearchTimeout(newTimeout);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [searchQuery]);

  const handleInterestToggle = (interestId) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleContinue = () => {
    console.log("Selected interests:", selectedInterests);
    router.push("/auth/private_spot");
  };

  const isButtonDisabled = selectedInterests.length < 3;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Header />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>What are your interests?</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              Select at least 3 interests to help us find better matches for you
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Text style={styles.searchIconText}>🔍</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search interests..."
            placeholderTextColor={color.gray300}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Interests List */}
        <ScrollView
          style={styles.interestsScrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.interestsContainer}>
            {filteredInterests.map((interest) => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestTag,
                  selectedInterests.includes(interest.id)
                    ? styles.selectedTag
                    : styles.unselectedTag,
                ]}
                onPress={() => handleInterestToggle(interest.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.emoji}>{interest.emoji}</Text>
                <Text
                  style={[
                    styles.interestLabel,
                    selectedInterests.includes(interest.id)
                      ? styles.selectedLabel
                      : styles.unselectedLabel,
                  ]}
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Selected Count */}
        <Text style={styles.selectedCount}>
          Selected: {selectedInterests.length} (minimum 3)
        </Text>

        {/* Continue Button */}
        <CustomButton
          title="Continue"
          onPress={handleContinue}
          isDisabled={isButtonDisabled}
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
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray300,
    lineHeight: 22,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: color.gray100,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 32,
    gap: 12,
    overflow: "hidden",
  },
  searchIcon: {
    opacity: 0.6,
  },
  searchIconText: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  interestsScrollView: {
    flex: 1,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 24,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 28,
    borderWidth: 1,
    gap: 6,
  },
  selectedTag: {
    backgroundColor: "#E3F2FD",
    borderColor: color.primary,
  },
  unselectedTag: {
    backgroundColor: color.white,
    borderColor: color.gray100,
  },
  emoji: {
    fontSize: 14,
  },
  interestLabel: {
    fontSize: 16,
    fontFamily: font.medium,
  },
  selectedLabel: {
    color: color.primary,
  },
  unselectedLabel: {
    color: color.black,
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    borderColor: color.gray100,
    paddingBottom: 24,
    gap: 16,
    paddingHorizontal: 16,
  },
  selectedCount: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray300,
    textAlign: "center",
  },
});
