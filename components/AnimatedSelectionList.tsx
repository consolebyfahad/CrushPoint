import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import AnimatedSelectionOption from "./AnimatedSelectionOption";

interface SelectionOption {
  id: string;
  label: string;
}

interface AnimatedSelectionListProps {
  options: SelectionOption[];
  selectedOptions: string[];
  onSelectionChange: (selectedOptions: string[]) => void;
  multiSelect?: boolean;
  containerStyle?: ViewStyle;
  maxSelections?: number;
  staggerAnimation?: boolean;
  staggerDelay?: number;
  selectedColor?: string;
  unselectedColor?: string;
  selectedBackgroundColor?: string;
  unselectedBackgroundColor?: string;
  selectedBorderColor?: string;
  unselectedBorderColor?: string;
}

export default function AnimatedSelectionList({
  options,
  selectedOptions,
  onSelectionChange,
  multiSelect = true,
  containerStyle,
  maxSelections,
  staggerAnimation = true,
  staggerDelay = 100,
  selectedColor,
  unselectedColor,
  selectedBackgroundColor,
  unselectedBackgroundColor,
  selectedBorderColor,
  unselectedBorderColor,
}: AnimatedSelectionListProps) {
  const mountAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (staggerAnimation) {
      mountAnimation.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      mountAnimation.value = 1;
    }
  }, []);

  const handleOptionSelect = (optionId: string) => {
    let newSelection: string[];

    if (multiSelect) {
      if (selectedOptions.includes(optionId)) {
        // Remove from selection
        newSelection = selectedOptions.filter((id) => id !== optionId);
      } else {
        // Add to selection (if under max limit)
        if (maxSelections && selectedOptions.length >= maxSelections) {
          return; // Don't allow more selections
        }
        newSelection = [...selectedOptions, optionId];
      }
    } else {
      // Single select mode
      newSelection = selectedOptions.includes(optionId) ? [] : [optionId];
    }

    onSelectionChange(newSelection);
  };

  const getAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const delay = staggerAnimation ? index * staggerDelay : 0;

      const translateY = withDelay(
        delay,
        withSpring(mountAnimation.value === 1 ? 0 : 30, {
          damping: 15,
          stiffness: 100,
        })
      );

      const opacity = withDelay(
        delay,
        withSpring(mountAnimation.value, {
          damping: 15,
          stiffness: 100,
        })
      );

      return {
        opacity,
        transform: [{ translateY }],
      };
    });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option, index) => {
        const animatedStyle = getAnimatedStyle(index);

        return (
          <Animated.View key={option.id} style={animatedStyle}>
            <AnimatedSelectionOption
              option={option}
              isSelected={selectedOptions.includes(option.id)}
              onSelect={handleOptionSelect}
              selectedColor={selectedColor}
              unselectedColor={unselectedColor}
              selectedBackgroundColor={selectedBackgroundColor}
              unselectedBackgroundColor={unselectedBackgroundColor}
              selectedBorderColor={selectedBorderColor}
              unselectedBorderColor={unselectedBorderColor}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0, // Gap is handled by individual items
  },
});
