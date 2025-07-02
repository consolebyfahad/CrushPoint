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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SelectionOption {
  id: string;
  emoji: string;
  label: string;
}

interface AnimatedSelectionOptionProps {
  option: SelectionOption;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  selectedColor?: string;
  unselectedColor?: string;
  selectedBackgroundColor?: string;
  unselectedBackgroundColor?: string;
  selectedBorderColor?: string;
  unselectedBorderColor?: string;
  animationDuration?: number;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedSelectionOption({
  option,
  isSelected,
  onSelect,
  containerStyle,
  textStyle,
  selectedColor = color.primary,
  unselectedColor = color.black,
  selectedBackgroundColor = color.gray95,
  unselectedBackgroundColor = color.white,
  selectedBorderColor = color.primary,
  unselectedBorderColor = color.gray87,
  animationDuration = 300,
}: AnimatedSelectionOptionProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(isSelected ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    });
  }, [isSelected]);

  const handlePress = () => {
    // Quick press animation
    pressScale.value = withSpring(
      0.95,
      {
        damping: 20,
        stiffness: 300,
      },
      () => {
        pressScale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
      }
    );

    // Haptic feedback (if available)
    if (typeof runOnJS === "function") {
      runOnJS(() => {
        // You can add haptic feedback here if using expo-haptics
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      })();
    }

    onSelect(option.id);
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

    const borderWidth = withTiming(isSelected ? 2 : 1, {
      duration: animationDuration,
    });

    return {
      backgroundColor,
      borderColor,
      borderWidth,
      transform: [{ scale: pressScale.value }, { scale: scale.value }],
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

  const animatedEmojiStyle = useAnimatedStyle(() => {
    const emojiScale = withSpring(isSelected ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });

    return {
      transform: [{ scale: emojiScale }],
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.optionButton, animatedContainerStyle, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Animated.Text style={[styles.emoji, animatedEmojiStyle]}>
        {option.emoji}
      </Animated.Text>
      <Animated.Text style={[styles.optionText, animatedTextStyle, textStyle]}>
        {option.label}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 18,
    fontFamily: font.medium,
  },
});
