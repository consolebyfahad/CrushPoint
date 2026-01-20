import { useAppContext } from "@/context/app_context";
import useGetCampaign from "@/hooks/useGetCampaign";
import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CampaignScreen() {
  const { t } = useTranslation();
  const { isLoggedIn, isHydrated, checkVerificationStatus } = useAppContext();
  const { campaign, loading } = useGetCampaign();
  const [showSkip, setShowSkip] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [hasSkipped, setHasSkipped] = useState(false);
  const videoRef = useRef<Video>(null);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigationPerformedRef = useRef(false);

  console.log("🎬 [Campaign] Component rendered", {
    hasCampaign: !!campaign,
    loading,
    campaignId: campaign?.id,
    adType: campaign?.ad_type,
    image: campaign?.image,
    thumb: campaign?.thumb,
  });

  useEffect(() => {
    // Start countdown from 5 seconds
    let countdown = 5;
    setSkipCountdown(countdown);

    // Update countdown every second
    countdownTimerRef.current = setInterval(() => {
      countdown -= 1;
      setSkipCountdown(countdown);
      
      if (countdown <= 0) {
        setShowSkip(true);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
      }
    }, 1000);

    return () => {
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const handleSkip = () => {
    setHasSkipped(true);
    navigateToApp();
  };

  const navigateToApp = async () => {
    if (navigationPerformedRef.current) return;
    navigationPerformedRef.current = true;

    if (!isHydrated) {
      router.replace("/");
      return;
    }

    if (isLoggedIn) {
      const isVerified = await checkVerificationStatus();
      if (isVerified) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/gender");
      }
    } else {
      router.replace("/onboarding");
    }
  };

  const handlePress = () => {
    if (campaign?.link) {
      Linking.openURL(campaign.link).catch((err) =>
        console.error("Failed to open link:", err)
      );
    }
  };

  // If no campaign or loading, navigate to app
  useEffect(() => {
    console.log("🔍 [Campaign] Checking campaign state", {
      loading,
      hasCampaign: !!campaign,
      isHydrated,
    });
    if (!loading && !campaign && isHydrated) {
      console.log("🚫 [Campaign] No campaign found, navigating to app");
      navigateToApp();
    }
  }, [loading, campaign, isHydrated]);

  // If user skipped, navigate
  useEffect(() => {
    if (hasSkipped && isHydrated) {
      navigateToApp();
    }
  }, [hasSkipped, isHydrated]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!campaign) {
    console.log("⏳ [Campaign] No campaign, returning null");
    return null; // Will navigate in useEffect
  }

  const imageUrl = getImageUrl();
  const videoUrl = getVideoUrl();
  const hasValidMedia = campaign.ad_type === "video" ? !!videoUrl : !!imageUrl;

  console.log("🎨 [Campaign] Rendering campaign screen", {
    adType: campaign.ad_type,
    hasImageUrl: !!imageUrl,
    hasVideoUrl: !!videoUrl,
    hasValidMedia,
    imageUrl,
    videoUrl,
  });

  // If no valid media URL, navigate to app
  useEffect(() => {
    if (!hasValidMedia && isHydrated) {
      console.log("⚠️ [Campaign] No valid media URL, navigating to app");
      navigateToApp();
    }
  }, [hasValidMedia, isHydrated]);

  if (!hasValidMedia) {
    return null;
  }

  const getImageUrl = () => {
    // For image type, use image or thumb
    if (campaign.image && campaign.image.trim() && campaign.image !== "null") {
      const imagePath = campaign.image.trim();
      if (imagePath.startsWith("http")) {
        console.log("🖼️ [Campaign] Using image URL (full):", imagePath);
        return imagePath;
      }
      // Remove leading slash if present
      const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
      const fullUrl = `${campaign.image_url}${cleanPath}`;
      console.log("🖼️ [Campaign] Using image URL (constructed):", fullUrl);
      return fullUrl;
    }
    if (campaign.thumb && campaign.thumb.trim() && !campaign.thumb.endsWith("/")) {
      const thumbPath = campaign.thumb.trim();
      if (thumbPath.startsWith("http")) {
        console.log("🖼️ [Campaign] Using thumb URL (full):", thumbPath);
        return thumbPath;
      }
      const cleanPath = thumbPath.startsWith("/") ? thumbPath.slice(1) : thumbPath;
      const fullUrl = `${campaign.image_url}${cleanPath}`;
      console.log("🖼️ [Campaign] Using thumb URL (constructed):", fullUrl);
      return fullUrl;
    }
    console.log("❌ [Campaign] No valid image URL found", {
      image: campaign.image,
      thumb: campaign.thumb,
      image_url: campaign.image_url,
    });
    return null;
  };

  const getVideoUrl = () => {
    // For video type, use image field which contains video URL
    if (campaign.image && campaign.image.trim() && campaign.image !== "null") {
      const videoPath = campaign.image.trim();
      if (videoPath.startsWith("http")) {
        console.log("🎥 [Campaign] Using video URL (full):", videoPath);
        return videoPath;
      }
      // Remove leading slash if present
      const cleanPath = videoPath.startsWith("/") ? videoPath.slice(1) : videoPath;
      const fullUrl = `${campaign.image_url}${cleanPath}`;
      console.log("🎥 [Campaign] Using video URL (constructed):", fullUrl);
      return fullUrl;
    }
    console.log("❌ [Campaign] No valid video URL found", {
      image: campaign.image,
      image_url: campaign.image_url,
    });
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={1}
        onPress={handlePress}
        disabled={!campaign.link}
      >
        {campaign.ad_type === "video" ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl || "" }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted={false}
            onError={(error) => {
              console.error("❌ [Campaign] Video error:", error);
              // If video fails, navigate to app
              navigateToApp();
            }}
            onLoad={() => {
              console.log("✅ [Campaign] Video loaded successfully");
            }}
          />
        ) : (
          <Image
            source={{ uri: imageUrl || "" }}
            style={styles.media}
            resizeMode="cover"
            onError={(error) => {
              console.error("❌ [Campaign] Image failed to load:", error);
              navigateToApp();
            }}
            onLoad={() => {
              console.log("✅ [Campaign] Image loaded successfully");
            }}
          />
        )}

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={showSkip ? handleSkip : undefined}
          activeOpacity={showSkip ? 0.8 : 1}
          disabled={!showSkip}
        >
          <Text style={styles.skipButtonText}>
            {showSkip
              ? t("campaign.skip") || "Skip"
              : `${t("campaign.skipIn") || "Skip in"} ${skipCountdown}s`}
          </Text>
        </TouchableOpacity>

        {/* Advertisement Label */}
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>
            {t("campaign.advertisement") || "Advertisement"}
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.black,
  },
  content: {
    flex: 1,
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.black,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  skipButtonText: {
    color: color.white,
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  adLabel: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  adLabelText: {
    color: color.white,
    fontSize: 12,
    fontFamily: font.regular,
  },
});
