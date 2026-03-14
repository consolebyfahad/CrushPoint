import { useAppContext } from "@/context/app_context";
import useGetCampaign from "@/hooks/useGetCampaign";
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

function getCampaignMediaUrl(campaign: any): string | null {
  if (
    !campaign?.image ||
    campaign.image.trim() === "" ||
    campaign.image === "null"
  ) {
    return null;
  }
  const mediaPath = campaign.image.trim();
  if (mediaPath.startsWith("http")) return mediaPath;
  const cleanPath = mediaPath.startsWith("/") ? mediaPath.slice(1) : mediaPath;
  return `${campaign.image_url || ""}${cleanPath}`;
}

export default function index() {
  console.log(
    "[index] App entry screen (app/index.tsx). Runs on cold start: shows splash ~2s, then routes to onboarding (if not done), /welcome (if not logged in), /campaign (if campaign with media), or /(tabs)|/auth/gender (if no campaign).",
  );
  const { isLoggedIn, isHydrated, checkVerificationStatus } = useAppContext();
  const { campaign, loading: campaignLoading } = useGetCampaign();
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
      console.log("routeAfterSplash");
      const onboardingCompleted = await AsyncStorage.getItem(
        "@onboarding_completed",
      );
      console.log("onboardingCompleted", onboardingCompleted);
      if (onboardingCompleted !== "true") {
        navigationPerformedRef.current = true;
        router.replace("/onboarding");
        return;
      }

      if (!isLoggedIn) {
        console.log("not logged in");
        navigationPerformedRef.current = true;
        router.push("/welcome");
        return;
      }

      if (campaignLoading) {
        console.log("campaign loading");
        return;
      }
      console.log("campaign", campaign);
      navigationPerformedRef.current = true;
      const mediaUrl = campaign ? getCampaignMediaUrl(campaign) : null;
      console.log("mediaUrl", mediaUrl);
      if (campaign && mediaUrl) {
        console.log("pushing to campaign");
        router.push("/campaign");
      } else {
        const isVerified = await checkVerificationStatus();
        if (isVerified) {
          console.log("isVerified", isVerified);
          router.replace("/(tabs)");
        } else {
          console.log("pushing to auth/gender");
          router.push("/auth/gender");
        }
      }
    };

    routeAfterSplash();
  }, [isLoggedIn, isHydrated, showSplash, campaignLoading, campaign]);

  const splashContent = (
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
          <Animated.View style={[styles.fallbackContainer, animatedImageStyle]}>
            <Text style={styles.fallbackText}>CP</Text>
          </Animated.View>
        )}
      </Animated.View>
      <Animated.Text style={[styles.appName, animatedTextStyle]}>
        Andra
      </Animated.Text>
    </View>
  );

  return splashContent;
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
    bottom: 100,
    color: color.white,
    fontFamily: font.bold,
    padding: 20,
    textAlign: "center",
  },
});
