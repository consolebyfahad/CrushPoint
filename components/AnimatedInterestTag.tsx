import { color, font } from "@/utils/constants";
import React, { useEffect } from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface InterestOption {
  id: string;
  name: string; // Now contains both emoji and text together
  distance: number;
  date: string;
  time: string;
  image_url: string;
}

interface AnimatedInterestTagProps {
  interest: InterestOption;
  isSelected: boolean;
  onToggle: (interestId: string) => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  selectedColor?: string;
  unselectedColor?: string;
  selectedBackgroundColor?: string;
  unselectedBackgroundColor?: string;
  selectedBorderColor?: string;
  unselectedBorderColor?: string;
  animationDuration?: number;
  index?: number;
  searchTriggered?: boolean;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedInterestTag({
  interest,
  isSelected,
  onToggle,
  containerStyle,
  textStyle,
  selectedColor = color.primary,
  unselectedColor = color.black,
  selectedBackgroundColor = color.gray95,
  unselectedBackgroundColor = color.white,
  selectedBorderColor = color.primary,
  unselectedBorderColor = color.gray87,
  animationDuration = 250,
  index = 0,
  searchTriggered = false,
}: AnimatedInterestTagProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(isSelected ? 1 : 0);
  const pressScale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, {
      damping: 12,
      stiffness: 200,
      mass: 0.8,
    });
  }, [isSelected]);

  // Search animation effect
  useEffect(() => {
    if (searchTriggered) {
      // Quick fade and slide animation when search filters change
      opacity.value = withSequence(
        withTiming(0.3, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      translateY.value = withSequence(
        withTiming(10, { duration: 100 }),
        withSpring(0, { damping: 15, stiffness: 150 })
      );
    }
  }, [searchTriggered]);

  const handlePress = () => {
    // Selection animation - more dramatic for selection/deselection
    if (isSelected) {
      // Deselection animation
      pressScale.value = withSequence(
        withSpring(1.1, { damping: 15, stiffness: 300 }),
        withSpring(0.95, { damping: 20, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    } else {
      // Selection animation
      pressScale.value = withSequence(
        withSpring(0.9, { damping: 20, stiffness: 400 }),
        withSpring(1.05, { damping: 15, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    }

    onToggle(interest.id);
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [unselectedBackgroundColor, selectedBackgroundColor]
    );

    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [unselectedBorderColor, selectedBorderColor]
    );

    const borderWidth = withTiming(isSelected ? 1.5 : 1, {
      duration: animationDuration,
    });

    return {
      backgroundColor,
      borderColor,
      borderWidth,
      opacity: opacity.value,
      transform: [
        { scale: pressScale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      progress.value,
      [0, 1],
      [unselectedColor, selectedColor]
    );

    return {
      color: textColor,
    };
  });

  const animatedNameStyle = useAnimatedStyle(() => {
    const nameScale = withSpring(isSelected ? 1.05 : 1, {
      damping: 12,
      stiffness: 200,
    });

    return {
      transform: [{ scale: nameScale }],
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.interestTag, animatedContainerStyle, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Animated.Text
        style={[
          styles.interestName,
          animatedTextStyle,
          animatedNameStyle,
          textStyle,
        ]}
      >
        {interest.name}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
  },
  interestName: {
    fontSize: 16,
    fontFamily: font.medium,
  },
});
