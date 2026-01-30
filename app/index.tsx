import { useAppContext } from "@/context/app_context";
import { color, font, image } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function index() {
  const { isLoggedIn, isHydrated } = useAppContext();
  const containerScale = useSharedValue(0);
  const imageScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const [imageError, setImageError] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const navigationPerformedRef = useRef(false);

  useEffect(() => {
    containerScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });

    setTimeout(() => {
      imageScale.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
      textOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
      textTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
    }, 400);
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  useEffect(() => {
    // Hide splash after 2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!isHydrated || showSplash) {
      return;
    }
    if (navigationPerformedRef.current) {
      return;
    }

    const routeAfterSplash = async () => {
      if (navigationPerformedRef.current) return;

      const onboardingCompleted = await AsyncStorage.getItem(
        "@onboarding_completed",
      );

      // 1) Onboarding not completed → onboarding first
      if (onboardingCompleted !== "true") {
        navigationPerformedRef.current = true;
        router.replace("/onboarding");
        return;
      }

      // 2) Onboarding completed → check login
      if (isLoggedIn) {
        console.log("Logged in, redirecting to campaign");
        navigationPerformedRef.current = true;
        router.push("/campaign");
        return;
      }

      // 3) Not logged in → login screen
      navigationPerformedRef.current = true;
      router.push("/welcome");
    };

    const timer = setTimeout(routeAfterSplash, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, isHydrated, showSplash]);

  // Show loading state while context is hydrating or splash is showing
  if (!isHydrated || showSplash) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.imageContainer, animatedContainerStyle]}>
          {!imageError ? (
            <Animated.Image
              style={[styles.image, animatedImageStyle]}
              source={image.splash}
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <Animated.View
              style={[styles.fallbackContainer, animatedImageStyle]}
            >
              <Text style={styles.fallbackText}>CP</Text>
            </Animated.View>
          )}
        </Animated.View>
        <Animated.Text style={[styles.appName, animatedTextStyle]}>
          Andra
        </Animated.Text>
      </View>
    );
  }

  // After splash, show nothing (navigation will happen)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: 120,
    width: 120,
    padding: 20,
    borderRadius: 32,
    backgroundColor: color.white,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "95%",
    resizeMode: "cover",
  },
  fallbackContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.primary,
    borderRadius: 16,
  },
  fallbackText: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.white,
  },
  appName: {
    fontSize: 28,
    position: "absolute",
    bottom: 80,
    color: color.white,
    fontFamily: font.bold,
  },
});
