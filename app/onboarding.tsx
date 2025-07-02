import CustomButton from "@/components/custom_button";
import { color, font } from "@/utils/constants";
import { requestUserLocation } from "@/utils/location";
import { requestFCMPermission } from "@/utils/notification";
import { svgIcon } from "@/utils/SvgIcons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    requiresPermission: "location",
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
    requiresPermission: "notification",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState({
    location: false,
    notification: false,
  });

  const currentData = onboardingData[currentIndex];
  const isLastScreen = currentIndex === onboardingData.length - 1;

  const requestLocationPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const location = await requestUserLocation();
      if (location) {
        setPermissionsGranted((prev) => ({ ...prev, location: true }));
        return true;
      } else {
        Alert.alert(
          "Location Permission",
          "Location access is needed to show you people nearby. You can enable it later in settings.",
          [{ text: "OK" }]
        );
        return false;
      }
    } catch (error) {
      console.error("Location permission error:", error);
      return false;
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const requestNotificationPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await requestFCMPermission();
      if (granted) {
        setPermissionsGranted((prev) => ({ ...prev, notification: true }));
        return true;
      } else {
        Alert.alert(
          "Notification Permission",
          "Notifications help you stay updated on matches and messages. You can enable them later in settings.",
          [{ text: "OK" }]
        );
        return false;
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      return false;
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleContinue = async () => {
    // Handle permission requests based on current step
    if (currentData.requiresPermission === "location") {
      const granted = await requestLocationPermission();
      // Continue regardless of permission result
    } else if (currentData.requiresPermission === "notification") {
      const granted = await requestNotificationPermission();
      // Continue regardless of permission result
    }

    if (isLastScreen) {
      router.push("/welcome");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    router.push("/welcome");
  };

  const getButtonTitle = () => {
    if (isRequestingPermission) {
      return "Requesting...";
    }

    if (currentData.requiresPermission === "location") {
      return "Enable Location";
    }

    if (currentData.requiresPermission === "notification") {
      return "Enable Notifications";
    }

    if (isLastScreen) {
      return "Get Started";
    }

    return "Continue";
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>{currentData.IconComponent}</View>
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>

        {/* Show permission status if applicable */}
        {currentData.requiresPermission && (
          <View style={styles.permissionStatus}>
            {permissionsGranted[
              currentData.requiresPermission as keyof typeof permissionsGranted
            ] ? (
              <View style={styles.permissionGranted}>
                <Feather name="check-circle" size={16} color={color.primary} />
                <Text style={styles.permissionText}>Permission granted!</Text>
              </View>
            ) : (
              <Text style={styles.permissionPrompt}>
                {currentData.requiresPermission === "location"
                  ? "We need location access to show you people nearby"
                  : "We need notification permission to keep you updated"}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <CustomButton
          title={getButtonTitle()}
          onPress={handleContinue}
          isDisabled={isRequestingPermission}
          rightIcon={
            <Feather
              name="arrow-right"
              size={18}
              color={isRequestingPermission ? color.gray55 : color.white}
            />
          }
        />
      </View>
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
  permissionStatus: {
    marginTop: 24,
    alignItems: "center",
  },
  permissionGranted: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.primary + "20", // 20% opacity
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permissionText: {
    marginLeft: 8,
    fontSize: 14,
    color: color.primary,
    fontFamily: font.medium,
  },
  permissionPrompt: {
    fontSize: 14,
    color: color.gray55,
    fontFamily: font.regular,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomContainer: {
    alignItems: "center",
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
});
