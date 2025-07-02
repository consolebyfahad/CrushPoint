import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import AnimatedInterestItem from "./AnimatedInterestItem";

interface InterestOption {
  id: string;
  emoji: string;
  label: string;
}

interface AnimatedInterestGridProps {
  interests: InterestOption[];
  selectedInterests: string[];
  onSelectionChange: (selectedInterests: string[]) => void;
  searchQuery: string;
  containerStyle?: ViewStyle;
  maxSelections?: number;
  minSelections?: number;
  staggerAnimation?: boolean;
  staggerDelay?: number;
  selectedColor?: string;
  unselectedColor?: string;
  selectedBackgroundColor?: string;
  unselectedBackgroundColor?: string;
  selectedBorderColor?: string;
  unselectedBorderColor?: string;
  showScrollIndicator?: boolean;
}

export default function AnimatedInterestGrid({
  interests,
  selectedInterests,
  onSelectionChange,
  searchQuery,
  containerStyle,
  maxSelections,
  minSelections,
  staggerAnimation = true,
  staggerDelay = 50,
  selectedColor,
  unselectedColor,
  selectedBackgroundColor,
  unselectedBackgroundColor,
  selectedBorderColor,
  unselectedBorderColor,
  showScrollIndicator = false,
}: AnimatedInterestGridProps) {
  const [filteredInterests, setFilteredInterests] =
    useState<InterestOption[]>(interests);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const mountAnimation = useSharedValue(0);
  const searchAnimation = useSharedValue(0);

  // Filter interests based on search query
  useEffect(() => {
    const filtered =
      searchQuery.trim() === ""
        ? interests
        : interests.filter((interest) =>
            interest.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

    // Trigger search animation
    if (searchQuery.trim() !== "") {
      setSearchTriggered(true);
      searchAnimation.value = withTiming(1, { duration: 200 }, () => {
        searchAnimation.value = withTiming(0, { duration: 200 });
      });

      // Reset search trigger after animation
      setTimeout(() => setSearchTriggered(false), 400);
    }

    setFilteredInterests(filtered);
  }, [searchQuery, interests]);

  // Mount animation
  useEffect(() => {
    if (staggerAnimation) {
      mountAnimation.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      mountAnimation.value = 1;
    }
  }, [filteredInterests]);

  const handleInterestToggle = (interestId: string) => {
    let newSelection: string[];

    if (selectedInterests.includes(interestId)) {
      // Remove from selection
      newSelection = selectedInterests.filter((id) => id !== interestId);
    } else {
      // Add to selection (if under max limit)
      if (maxSelections && selectedInterests.length >= maxSelections) {
        return; // Don't allow more selections
      }
      newSelection = [...selectedInterests, interestId];
    }

    onSelectionChange(newSelection);
  };

  // Container animation for search
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(searchAnimation.value, [0, 0.5, 1], [1, 0.98, 1]),
        },
      ],
    };
  });

  return (
    <ScrollView
      style={[styles.scrollView, containerStyle]}
      showsVerticalScrollIndicator={showScrollIndicator}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {filteredInterests.map((interest, index) => (
          <AnimatedInterestItem
            key={interest.id}
            interest={interest}
            isSelected={selectedInterests.includes(interest.id)}
            onToggle={handleInterestToggle}
            index={index}
            mountAnimation={mountAnimation}
            searchAnimation={searchAnimation}
            staggerDelay={staggerDelay}
            searchTriggered={searchTriggered}
            selectedColor={selectedColor}
            unselectedColor={unselectedColor}
            selectedBackgroundColor={selectedBackgroundColor}
            unselectedBackgroundColor={unselectedBackgroundColor}
            selectedBorderColor={selectedBorderColor}
            unselectedBorderColor={unselectedBorderColor}
          />
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0, // Gap is handled by individual items
  },
});
