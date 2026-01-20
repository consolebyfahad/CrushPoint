import { useAppContext } from "@/context/app_context";
import useGetCampaign from "@/hooks/useGetCampaign";
import { color, font, image } from "@/utils/constants";
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
  const { isLoggedIn, isHydrated, checkVerificationStatus, isUserVerified } =
    useAppContext();
  const { campaign, loading: campaignLoading } = useGetCampaign();
  const containerScale = useSharedValue(0);
  const imageScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const [imageError, setImageError] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const navigationPerformedRef = useRef(false);

  console.log("🔵 [Index] Component rendered", {
    isHydrated,
    isLoggedIn,
    showSplash,
    campaignLoading,
    hasCampaign: !!campaign,
    navigationPerformed: navigationPerformedRef.current,
  });

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
    console.log("🟡 [Index] Starting splash screen timer (2 seconds)");
    const splashTimer = setTimeout(() => {
      console.log("🟢 [Index] Splash screen timer completed, hiding splash");
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    console.log("🟣 [Index] Navigation effect triggered", {
      isHydrated,
      showSplash,
      navigationPerformed: navigationPerformedRef.current,
      campaignLoading,
      hasCampaign: !!campaign,
      isLoggedIn,
    });

    if (!isHydrated || showSplash) {
      console.log(
        "⏸️ [Index] Skipping navigation - waiting for hydration or splash",
        {
          isHydrated,
          showSplash,
        }
      );
      return;
    }
    if (navigationPerformedRef.current) {
      console.log("⏸️ [Index] Navigation already performed, skipping");
      return;
    }

    const checkUserStatus = async () => {
      console.log("🔍 [Index] Checking user status...");

      if (navigationPerformedRef.current) {
        console.log(
          "⏸️ [Index] Navigation already performed in checkUserStatus"
        );
        return;
      }

      // If campaign exists and is loading, wait for it
      if (campaignLoading) {
        console.log("⏳ [Index] Campaign is loading, waiting...");
        return;
      }

      // If campaign exists, navigate to campaign screen first
      if (campaign) {
        console.log(
          "📢 [Index] Campaign found, navigating to campaign screen",
          {
            campaignId: campaign.id,
            adType: campaign.ad_type,
          }
        );
        navigationPerformedRef.current = true;
        router.replace("/campaign");
        return;
      }

      console.log(
        "🚫 [Index] No campaign found, proceeding with normal navigation"
      );

      // No campaign, proceed with normal navigation
      if (isLoggedIn) {
        console.log(
          "👤 [Index] User is logged in, checking verification status..."
        );
        const isVerified = await checkVerificationStatus();
        console.log("✅ [Index] Verification status:", isVerified);

        if (isVerified) {
          console.log("🏠 [Index] User verified, navigating to tabs");
          navigationPerformedRef.current = true;
          router.replace("/(tabs)");
        } else {
          console.log(
            "🔐 [Index] User not verified, navigating to gender/auth"
          );
          navigationPerformedRef.current = true;
          router.replace("/auth/gender");
        }
      } else {
        console.log("🚪 [Index] User not logged in, navigating to onboarding");
        navigationPerformedRef.current = true;
        router.replace("/onboarding");
      }
    };

    // Small delay to ensure campaign check is complete
    console.log("⏱️ [Index] Setting navigation timer (100ms delay)");
    const timer = setTimeout(checkUserStatus, 100);

    return () => {
      console.log("🧹 [Index] Cleaning up navigation timer");
      clearTimeout(timer);
    };
  }, [isLoggedIn, isHydrated, showSplash, campaign, campaignLoading]);

  // Show loading state while context is hydrating or splash is showing
  if (!isHydrated || showSplash) {
    console.log("🎨 [Index] Rendering splash screen", {
      isHydrated,
      showSplash,
      imageError,
    });
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.imageContainer, animatedContainerStyle]}>
          {!imageError ? (
            <Animated.Image
              style={[styles.image, animatedImageStyle]}
              source={image.splash}
              onError={() => {
                console.log("❌ [Index] Splash image error");
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
  console.log(
    "⚪ [Index] Splash hidden, returning null (navigation in progress)"
  );
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
