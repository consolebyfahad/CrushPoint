import CustomButton from "@/components/custom_button";
import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export const onboardingData = [
  {
    id: 1,
    IconComponent: svgIcon.Onboarding1,
    title: "Love at first sight.",
    description:
      "Meet your soulmate in real life.\nForget swiping left and right.",
  },
  {
    id: 2,
    IconComponent: svgIcon.Onboarding2,
    title: "See who's around you",
    description: "Discover interesting people nearby and connect in real life",
  },
  {
    id: 3,
    IconComponent: svgIcon.Onboarding3,
    title: "Send a reaction",
    description: "Express interest with fun emojis - no chat needed",
  },
  {
    id: 4,
    IconComponent: svgIcon.Onboarding4,
    title: "Meet people on events",
    description: "See if someone interesting is joining the same event as you",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);

  const currentData = onboardingData[currentIndex];
  const isLastScreen = currentIndex === onboardingData.length - 1;

  const animateContentIn = () => {
    // Reset values
    iconScale.value = 0;
    iconOpacity.value = 0;
    titleOpacity.value = 0;
    descriptionOpacity.value = 0;

    // Animate icon
    iconScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    iconOpacity.value = withTiming(1, { duration: 300 });

    // Animate title with delay
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // Animate description with more delay
    descriptionOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  };

  const animateContentOut = (callback: any) => {
    iconOpacity.value = withTiming(0, { duration: 200 });
    titleOpacity.value = withTiming(0, { duration: 200 });
    descriptionOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(callback)();
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      animateContentIn();
    }, 100);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleContinue = () => {
    if (isAnimating) return;

    if (isLastScreen) {
      router.push("/welcome");
    } else {
      setIsAnimating(true);
      animateContentOut(() => {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      });
    }
  };

  const handleSkip = () => {
    router.push("/welcome");
  };

  // Animated styles
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      {
        translateY: withTiming(titleOpacity.value === 1 ? 0 : 20, {
          duration: 400,
        }),
      },
    ],
  }));

  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
    transform: [
      {
        translateY: withTiming(descriptionOpacity.value === 1 ? 0 : 20, {
          duration: 400,
        }),
      },
    ],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.skipButton}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          {currentData.IconComponent}
        </Animated.View>

        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          {currentData.title}
        </Animated.Text>

        <Animated.Text style={[styles.description, descriptionAnimatedStyle]}>
          {currentData.description}
        </Animated.Text>
      </View>

      <Animated.View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(700 + index * 100)}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <Animated.View style={styles.buttonContainer}>
          <CustomButton
            title={isLastScreen ? "Get Started" : "Continue"}
            onPress={handleContinue}
            isDisabled={isAnimating}
            rightIcon={
              <Feather name="arrow-right" size={18} color={color.white} />
            }
          />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    padding: 16,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    color: color.gray55,
    fontFamily: font.medium,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 0,
  },
  indicatorContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.gray87,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: color.primary,
    width: 8,
  },
  buttonContainer: {
    width: "100%",
  },
});
