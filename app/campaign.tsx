import { useAppContext } from "@/context/app_context";
import useGetCampaign from "@/hooks/useGetCampaign";
import { color, font } from "@/utils/constants";
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
import Svg, { Path } from "react-native-svg";

// Parse skip_timer (e.g. "00:00:10" or "00:00:05") to total seconds
function parseSkipTimerSeconds(skipTimer: string | undefined): number {
  if (!skipTimer || typeof skipTimer !== "string") return 10;
  const trimmed = skipTimer.trim();
  if (!trimmed) return 10;
  const parts = trimmed.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return Math.max(0, h * 3600 + m * 60 + s);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return Math.max(0, m * 60 + s);
  }
  if (parts.length === 1) return Math.max(0, parts[0]);
  return 10;
}

const DEFAULT_TIMER_SECONDS = 10;

export default function CampaignScreen() {
  const { campaign, loading } = useGetCampaign();
  const { isHydrated, checkVerificationStatus } = useAppContext();
  const videoRef = useRef<Video>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigationPerformedRef = useRef(false);
  const timerSeconds = campaign
    ? parseSkipTimerSeconds((campaign as any).skip_timer)
    : DEFAULT_TIMER_SECONDS;
  const [countdown, setCountdown] = useState(timerSeconds);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const countdownFinished = countdown <= 0;
  // Get media URL helper function
  const getMediaUrl = (campaignData: typeof campaign) => {
    if (
      !campaignData?.image ||
      campaignData.image.trim() === "" ||
      campaignData.image === "null"
    ) {
      return null;
    }

    const mediaPath = campaignData.image.trim();
    if (mediaPath.startsWith("http")) {
      return mediaPath;
    }

    // Construct full URL
    const cleanPath = mediaPath.startsWith("/")
      ? mediaPath.slice(1)
      : mediaPath;
    return `${campaignData.image_url}${cleanPath}`;
  };

  const mediaUrl = campaign ? getMediaUrl(campaign) : null;

  // No campaign or no media: go straight to tabs (we only land here when logged in)
  useEffect(() => {
    if (
      !loading &&
      isHydrated &&
      (!campaign || !mediaUrl) &&
      !navigationPerformedRef.current
    ) {
      navigateAfterCampaign();
    }
  }, [loading, isHydrated, campaign, mediaUrl]);

  // Countdown from campaign skip_timer (e.g. 10) to 0; do not auto-navigate when 0
  useEffect(() => {
    if (
      !loading &&
      campaign &&
      mediaUrl &&
      mediaLoaded &&
      isHydrated &&
      !navigationPerformedRef.current
    ) {
      const seconds = parseSkipTimerSeconds((campaign as any).skip_timer);
      setCountdown(seconds);

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0; // Stop at 0; user taps close icon to exit
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      };
    }
  }, [loading, campaign, mediaUrl, mediaLoaded, isHydrated]);

  const navigateAfterCampaign = async () => {
    if (navigationPerformedRef.current) return;

    if (!isHydrated) {
      setTimeout(() => navigateAfterCampaign(), 100);
      return;
    }

    navigationPerformedRef.current = true;
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // We only reach campaign when logged in (from splash). Just go to tabs or verification.
    const isVerified = await checkVerificationStatus();
    if (isVerified) {
      router.replace("/(tabs)");
    } else {
      router.push("/auth/gender");
    }
  };

  const handleClose = () => {
    if (!navigationPerformedRef.current) {
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
  const isVideo =
    campaign.ad_type === "video" ||
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

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Mute Icon Component
  const MuteIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.63 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.53C15.58 18.04 14.83 18.46 14 18.7V20.77C15.38 20.45 16.63 19.82 17.68 18.96L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z"
        fill="white"
      />
    </Svg>
  );

  // Unmute/Volume Icon Component
  const VolumeIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.03C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"
        fill="white"
      />
    </Svg>
  );

  // Close (X) Icon - shown when countdown reaches 0
  const CloseIcon = () => (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
        fill="white"
      />
    </Svg>
  );

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
            isMuted={isMuted}
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

      {/* Mute Button - Only show for videos */}
      {isVideo && (
        <TouchableOpacity
          style={styles.muteButton}
          onPress={handleToggleMute}
          activeOpacity={0.7}
        >
          {isMuted ? <MuteIcon /> : <VolumeIcon />}
        </TouchableOpacity>
      )}

      {/* Timer / Close: countdown N to 0, then close icon (no auto-skip) */}
      <TouchableOpacity
        style={[
          styles.timerButton,
          countdownFinished && styles.timerButtonClose,
        ]}
        onPress={countdownFinished ? handleClose : undefined}
        activeOpacity={0.7}
      >
        {countdownFinished ? (
          <CloseIcon />
        ) : (
          <Text style={styles.timerButtonText}>{countdown}</Text>
        )}
      </TouchableOpacity>

      {/* Download Now Button */}
      {campaign.link && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadNow}
          activeOpacity={0.8}
        >
          <Text style={styles.downloadButtonText}>
            {campaign?.button_text || "Download Now"}
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
  muteButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: color.white,
  },
  timerButton: {
    position: "absolute",
    top: 60,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },
  timerButtonClose: {
    height: 24,
    width: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  timerButtonText: {
    color: color.white,
    fontSize: 16,
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
