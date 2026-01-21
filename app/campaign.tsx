import { useAppContext } from "@/context/app_context";
import useGetCampaign from "@/hooks/useGetCampaign";
import { color, font } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResizeMode, Video } from "expo-av";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  const { campaign, loading } = useGetCampaign();
  const { isLoggedIn, checkVerificationStatus } = useAppContext();
  const videoRef = useRef<Video>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigationPerformedRef = useRef(false);
  const [countdown, setCountdown] = useState(15);
  const [skipEnabled, setSkipEnabled] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  // Get media URL helper function
  const getMediaUrl = (campaignData: typeof campaign) => {
    if (!campaignData?.image || campaignData.image.trim() === "" || campaignData.image === "null") {
      return null;
    }

    const mediaPath = campaignData.image.trim();
    if (mediaPath.startsWith("http")) {
      return mediaPath;
    }

    // Construct full URL
    const cleanPath = mediaPath.startsWith("/") ? mediaPath.slice(1) : mediaPath;
    return `${campaignData.image_url}${cleanPath}`;
  };

  const mediaUrl = campaign ? getMediaUrl(campaign) : null;

  // Handle countdown and navigation - only start after media is loaded
  useEffect(() => {
    if (!loading && campaign && mediaUrl && mediaLoaded && !navigationPerformedRef.current) {
      // Start countdown from 15 to 1
      setCountdown(15);
      setSkipEnabled(false);

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Countdown finished, navigate based on onboarding and login status
            if (!navigationPerformedRef.current) {
              // Use setTimeout to avoid state update during render
              setTimeout(() => {
                navigateAfterCampaign();
              }, 0);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Enable skip after 5 seconds (when countdown reaches 10)
      timerRef.current = setTimeout(() => {
        setSkipEnabled(true);
      }, 5000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [loading, campaign, mediaUrl, mediaLoaded]);

  const navigateAfterCampaign = async () => {
    if (navigationPerformedRef.current) return;
    navigationPerformedRef.current = true;
    
    // Clear timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Check if onboarding is completed
    const onboardingCompleted = await AsyncStorage.getItem("@onboarding_completed");
    
    if (isLoggedIn) {
      console.log("isLoggedIn", isLoggedIn);
      // User is logged in, check verification status
      const isVerified = await checkVerificationStatus();
      console.log("isVerified", isVerified);
      if (isVerified) {
        console.log("redirecting to tabs");
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/gender");
      }
    } else {
      console.log("onboardingCompleted", onboardingCompleted);
      // User not logged in
      if (onboardingCompleted === "true") {
        // Onboarding completed, go to login screen
        router.replace("/welcome");
      } else {
        // Onboarding not completed, show onboarding
        router.replace("/onboarding");
      }
    }
  };

  const handleSkip = () => {
    if (skipEnabled && !navigationPerformedRef.current) {
      navigateAfterCampaign();
    }
  };

  // Show loading while fetching
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Navigate away if no campaign or no media
  if (!campaign || !mediaUrl) {
    return null;
  }

  // Determine if we should show video (if ad_type is video, or if URL ends with video extension)
  const isVideo = campaign.ad_type === "video" || 
    mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) !== null;

  const handleMediaLoad = () => {
    setMediaLoaded(true);
  };

  const handlePress = () => {
    if (campaign.link) {
      Linking.openURL(campaign.link).catch(() => {
        // Error opening link - silently fail
      });
    }
  };

  const handleDownloadNow = () => {
    if (campaign.link) {
      Linking.openURL(campaign.link).catch(() => {
        // Error opening link - silently fail
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={1}
        onPress={handlePress}
        disabled={!campaign.link}
      >
        {isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted={false}
            onLoad={handleMediaLoad}
            onError={() => {
              // If video fails to load, treat as loaded to continue flow
              setMediaLoaded(true);
            }}
          />
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode="cover"
            onLoad={handleMediaLoad}
            onError={() => {
              // If image fails to load, treat as loaded to continue flow
              setMediaLoaded(true);
            }}
          />
        )}
      </TouchableOpacity>
      
      {/* Skip Button */}
      <TouchableOpacity
        style={[
          styles.skipButton,
          !skipEnabled && styles.skipButtonDisabled,
        ]}
        onPress={handleSkip}
        disabled={!skipEnabled}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>
          Skip {countdown > 0 ? countdown : ""}
        </Text>
      </TouchableOpacity>

      {/* Download Now Button */}
      {campaign.link && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadNow}
          activeOpacity={0.8}
        >
          <Text style={styles.downloadButtonText}>
            Download Now
          </Text>
        </TouchableOpacity>
      )}
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
    borderWidth: 1,
    borderColor: color.white,
  },
  skipButtonDisabled: {
    opacity: 0.5,
  },
  skipButtonText: {
    color: color.white,
    fontSize: 14,
    fontWeight: "600",
  },
  downloadButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: color.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  downloadButtonText: {
    color: color.white,
    fontSize: 16,
    fontFamily: font.bold,
    fontWeight: "700",
  },
});
