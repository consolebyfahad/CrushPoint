import React from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import AnimatedInterestTag from "./AnimatedInterestTag";

interface InterestOption {
  id: string;
  name: string;
  distance: number;
  date: string;
  time: string;
  image_url: string;
}

interface AnimatedInterestItemProps {
  interest: InterestOption;
  isSelected: boolean;
  onToggle: (interestId: string) => void;
  index: number;
  mountAnimation: any;
  searchAnimation: any;
  staggerDelay: number;
  searchTriggered: boolean;
  selectedColor?: string;
  unselectedColor?: string;
  selectedBackgroundColor?: string;
  unselectedBackgroundColor?: string;
  selectedBorderColor?: string;
  unselectedBorderColor?: string;
}

export default function AnimatedInterestItem({
  interest,
  isSelected,
  onToggle,
  index,
  mountAnimation,
  searchAnimation,
  staggerDelay,
  searchTriggered,
  selectedColor,
  unselectedColor,
  selectedBackgroundColor,
  unselectedBackgroundColor,
  selectedBorderColor,
  unselectedBorderColor,
}: AnimatedInterestItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const delay = index * staggerDelay;
    const translateY = withDelay(
      delay,
      withSpring(mountAnimation.value === 1 ? 0 : 20)
    );
    const opacity = withDelay(delay, withSpring(mountAnimation.value));
    const scale = interpolate(searchAnimation.value, [0, 0.5, 1], [1, 0.95, 1]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedInterestTag
        interest={interest}
        isSelected={isSelected}
        onToggle={onToggle}
        index={index}
        searchTriggered={searchTriggered}
        selectedColor={selectedColor}
        unselectedColor={unselectedColor}
        selectedBackgroundColor={selectedBackgroundColor}
        unselectedBackgroundColor={unselectedBackgroundColor}
        selectedBorderColor={selectedBorderColor}
        unselectedBorderColor={unselectedBorderColor}
      />
    </Animated.View>
  );
}
