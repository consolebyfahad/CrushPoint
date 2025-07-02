import AnimatedInterestGrid from "@/components/AnimatedInterestGrid";
import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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
  const { updateUserData } = useAppContext();
  const { fromEdit } = useLocalSearchParams();
  const isEdit = fromEdit === "true";
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const minSelections = 3;
  const isButtonDisabled = selectedInterests.length < minSelections;

  // Animation values
  const counterProgress = useSharedValue(0);

  // Animate counter color based on selection count
  useEffect(() => {
    counterProgress.value = withSpring(
      selectedInterests.length >= minSelections ? 1 : 0,
      {
        damping: 15,
        stiffness: 200,
      }
    );
  }, [selectedInterests.length]);

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedInterests(newSelection);
  };

  const handleContinue = () => {
    updateUserData({ interests: selectedInterests });
    router.push("/auth/private_spot");
  };

  // Animated styles for counter
  const animatedCounterStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      counterProgress.value,
      [0, 1],
      [color.gray55, color.primary]
    );

    return {
      color: textColor,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>What are your interests?</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} /> Select at
              least 3 interests to help us find better matches for you
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.searchContainer,
            Platform.OS === "ios" && { paddingVertical: 14 },
          ]}
        >
          <View style={styles.searchIcon}>
            <Feather name="search" size={20} color={color.gray55} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search interests..."
            placeholderTextColor={color.gray55}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <AnimatedInterestGrid
          interests={allInterests}
          selectedInterests={selectedInterests}
          onSelectionChange={handleSelectionChange}
          searchQuery={searchQuery}
          minSelections={minSelections}
          staggerAnimation={true}
          staggerDelay={30}
          containerStyle={styles.interestsContainer}
        />
      </View>

      {!isEdit ? (
        <View style={styles.bottomSection}>
          <Animated.Text style={[styles.selectedCount, animatedCounterStyle]}>
            Selected: {selectedInterests.length} (minimum {minSelections})
          </Animated.Text>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            isDisabled={isButtonDisabled}
          />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Save Changes"
            onPress={handleContinue}
            isDisabled={selectedInterests.length === 0}
          />
        </View>
      )}
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
    padding: 16,
  },
  titleSection: {
    paddingTop: 40,
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
    color: color.gray55,
    lineHeight: 22,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: color.gray87,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
    overflow: "hidden",
  },
  searchIcon: {
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  interestsContainer: {
    flex: 1,
  },
  bottomSection: {
    borderTopWidth: 1,
    padding: 16,
    borderColor: color.gray87,
    gap: 12,
  },
  buttonContainer: {
    padding: 16,
  },
  selectedCount: {
    fontSize: 16,
    fontFamily: font.regular,
    textAlign: "center",
  },
});
