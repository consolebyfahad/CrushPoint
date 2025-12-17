import CustomButton from "@/components/custom_button";
import RequestMeetup from "@/components/request_meetup";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { calculateDistance } from "@/utils/distanceCalculator";
import { svgIcon } from "@/utils/SvgIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MatchScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { user, userData } = useAppContext();
  console.log("params", userData);
  // Parse matchData from params
  let matchData;
  try {
    if (params?.matchData) {
      matchData = JSON.parse(params.matchData as string);

      // Fix current user image if it's malformed
      if (
        matchData.currentUser?.image &&
        matchData.currentUser.image.includes("[")
      ) {
        // Extract the first image from the malformed URL
        const imageMatch = matchData.currentUser.image.match(/\["([^"]+)"\]/);
        if (imageMatch && imageMatch[1]) {
          matchData.currentUser.image = `https://api.andra-dating.com/images/${imageMatch[1]}`;
        } else {
          matchData.currentUser.image =
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face";
        }
      }

      // If current user image is still empty, get from userData
      if (
        !matchData.currentUser?.image ||
        matchData.currentUser.image.trim() === ""
      ) {
        console.log("🖼️ Current user image empty, getting from userData");

        // Get image from userData.photos (already parsed URLs)
        if (
          userData?.photos &&
          Array.isArray(userData.photos) &&
          userData.photos.length > 0
        ) {
          matchData.currentUser.image = userData.photos[0];
          console.log(
            "✅ Using image from userData.photos:",
            matchData.currentUser.image
          );
        }
        // Fallback to images array
        else if (
          userData?.images &&
          Array.isArray(userData.images) &&
          userData.images.length > 0
        ) {
          const imageUrl = userData.images[0].startsWith("http")
            ? userData.images[0]
            : `https://api.andra-dating.com/images/${userData.images[0]}`;
          matchData.currentUser.image = imageUrl;
          console.log(
            "✅ Using image from userData.images:",
            matchData.currentUser.image
          );
        }
        // Final fallback to default image
        else {
          const defaultImage =
            userData?.gender === "female"
              ? "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg"
              : "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
          matchData.currentUser.image = defaultImage;
          console.log("⚠️ Using default image:", matchData.currentUser.image);
        }
      }

      // Update current user name if empty
      if (
        !matchData.currentUser?.name ||
        matchData.currentUser.name === "You"
      ) {
        matchData.currentUser.name = userData?.name || "You";
      }

      // Update current user location if empty
      if (!matchData.currentUser?.lat || !matchData.currentUser?.lng) {
        matchData.currentUser.lat = userData?.lat || "";
        matchData.currentUser.lng = userData?.lng || "";
      }

      // Calculate real distance between users
      if (
        matchData.currentUser?.lat &&
        matchData.currentUser?.lng &&
        matchData.matchedUser?.lat &&
        matchData.matchedUser?.lng
      ) {
        const currentUserCoords = {
          lat: parseFloat(matchData.currentUser.lat),
          lng: parseFloat(matchData.currentUser.lng),
        };
        const matchedUserCoords = {
          lat: parseFloat(matchData.matchedUser.lat),
          lng: parseFloat(matchData.matchedUser.lng),
        };

        const calculatedDistance = calculateDistance(
          currentUserCoords,
          matchedUserCoords
        );
        matchData.matchedUser.distance = `${calculatedDistance} away`;
      } else if (
        matchData.matchedUser?.distance === "Unbekannt" ||
        matchData.matchedUser?.distance === "Unknown"
      ) {
        matchData.matchedUser.distance = "Location unknown";
      }
    } else {
      matchData = {
        currentUser: {
          name: "You",
          image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
        },
        matchedUser: {
          name: "Julia",
          age: 24,
          distance: "1.2 km away",
          image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
        },
      };
    }
  } catch (error) {
    console.error("❌ Error parsing matchData:", error);
    matchData = {
      currentUser: {
        name: "You",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      },
      matchedUser: {
        name: "Julia",
        age: 24,
        distance: "1.2 km away",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      },
    };
  }

  // Animation refs
  const confettiRef = useRef<LottieView>(null);
  const heartsRef = useRef<LottieView>(null);
  const sparklesRef = useRef<LottieView>(null);
  const celebrationRef = useRef<LottieView>(null);
  const heartBeatRef = useRef<LottieView>(null);

  // Animation values - SEPARATED for iOS compatibility
  const blurOpacity = useRef(new Animated.Value(0)).current;

  // Left image animations
  const leftImageX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const leftImageRotate = useRef(new Animated.Value(0)).current;
  const leftImageScale = useRef(new Animated.Value(0.8)).current;

  // Right image animations
  const rightImageX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const rightImageRotate = useRef(new Animated.Value(0)).current;
  const rightImageScale = useRef(new Animated.Value(0.8)).current;

  const matchTextScale = useRef(new Animated.Value(0)).current;
  const matchTextY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const heartContainerScale = useRef(new Animated.Value(0)).current;

  // State for controlling animations
  const [showLottieAnimations, setShowLottieAnimations] = useState(false);
  // State for meetup request modal
  const [showRequestMeetup, setShowRequestMeetup] = useState(false);
  const [isSubmittingMeetup, setIsSubmittingMeetup] = useState(false);

  useEffect(() => {
    startAnimationSequence();
  }, []);

  const startAnimationSequence = () => {
    // 1. Blur layer appears
    setTimeout(() => {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 200);

    // 2. Show Lottie animations
    setTimeout(() => {
      setShowLottieAnimations(true);
      // Start confetti
      confettiRef.current?.play();
      // Start background hearts
      heartsRef.current?.play();
    }, 500);

    // 3. Images slide in with improved animations
    setTimeout(() => {
      Animated.parallel([
        // Left image animations
        Animated.spring(leftImageX, {
          toValue: SCREEN_WIDTH * 0.12,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(leftImageRotate, {
          toValue: -12,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(leftImageScale, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
        // Right image animations
        Animated.spring(rightImageX, {
          toValue: -SCREEN_WIDTH * 0.12,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(rightImageRotate, {
          toValue: 12,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(rightImageScale, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // 4. Heart container appears
    setTimeout(() => {
      Animated.spring(heartContainerScale, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }).start(() => {
        // Start heart beat animation
        heartBeatRef.current?.play();
      });
    }, 1200);

    // 5. Start sparkles
    setTimeout(() => {
      sparklesRef.current?.play();
    }, 1400);

    // 6. "It's a Match" text appears
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(matchTextScale, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(matchTextY, {
          toValue: 0,
          tension: 180,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1600);

    // 7. Content appears
    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 2200);

    // 8. Start celebration animation
    setTimeout(() => {
      celebrationRef.current?.play();
    }, 2000);
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleOptions = () => {};

  const handleRequestMeetup = () => {
    setShowRequestMeetup(true);
  };

  const handleSubmitMeetupRequest = async (meetupData: any) => {
    setIsSubmittingMeetup(true);

    if (!user?.user_id) {
      Alert.alert("Error", "User not found. Please try again.");
      setIsSubmittingMeetup(false);
      return;
    }

    if (!matchData?.matchedUser?.id) {
      Alert.alert("Error", "Match information is missing. Please try again.");
      setIsSubmittingMeetup(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("user_id", user.user_id);
      formData.append("table_name", "meetup_requests");
      formData.append("date_id", matchData.matchedUser.id);
      formData.append("date", meetupData.date);
      formData.append("new_date", meetupData.date);
      formData.append("time", meetupData.time);
      formData.append("location", meetupData.location);
      formData.append("message", meetupData.message || "Let's meet up!");

      const response = await apiCall(formData);

      if (response?.result) {
        router.push({
          pathname: "/matches",
          params: {
            activeTab: "requests",
          },
        });
      } else {
        Alert.alert(
          "Error",
          response?.message ||
            "Failed to send meetup request. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error submitting meetup request:", error);
      Alert.alert(
        "Error",
        "Network error occurred. Please check your connection and try again."
      );
    } finally {
      setIsSubmittingMeetup(false);
    }
  };

  const handleKeepExploring = () => {
    router.push({
      pathname: "/(tabs)",
      params: {
        activeTab: "matches",
      },
    });
  };

  // Interpolate rotation values
  const leftRotation = leftImageRotate.interpolate({
    inputRange: [-12, 0],
    outputRange: ["-12deg", "0deg"],
  });

  const rightRotation = rightImageRotate.interpolate({
    inputRange: [0, 12],
    outputRange: ["0deg", "12deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Lottie Background Animations */}
      {showLottieAnimations && (
        <>
          {/* Confetti Animation */}
          <LottieView
            ref={confettiRef}
            style={styles.confettiAnimation}
            source={require("@/assets/animations/confetti.json")}
            autoPlay={false}
            loop={false}
            speed={1.2}
          />

          {/* Background Hearts */}
          <LottieView
            ref={heartsRef}
            style={styles.backgroundHeartsAnimation}
            source={require("@/assets/animations/floating-hearts.json")}
            autoPlay={false}
            loop={true}
            speed={0.8}
          />

          {/* Sparkles around images */}
          <LottieView
            ref={sparklesRef}
            style={styles.sparklesAnimation}
            source={require("@/assets/animations/confetti.json")}
            autoPlay={false}
            loop={true}
            speed={1.5}
          />

          {/* Celebration particles */}
          <LottieView
            ref={celebrationRef}
            style={styles.celebrationAnimation}
            source={require("@/assets/animations/confetti.json")}
            autoPlay={false}
            loop={false}
            speed={1}
          />
        </>
      )}

      {/* Blur Layer */}
      <Animated.View
        style={[
          styles.blurLayer,
          {
            opacity: blurOpacity,
          },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity> */}
        {/* <Text style={styles.headerTitle}>{t("match.title")}</Text> */}
        {/* <TouchableOpacity style={styles.headerButton} onPress={handleOptions}>
          <Ionicons name="ellipsis-vertical" size={24} color={color.black} />
        </TouchableOpacity> */}
      </View>

      {/* Match Animation Container */}
      <View style={styles.matchContainer}>
        {/* "It's a Match" Text */}
        <Animated.View
          style={[
            styles.matchTextContainer,
            {
              transform: [
                { scale: matchTextScale },
                { translateY: matchTextY },
              ],
            },
          ]}
        >
          <View style={styles.matchBubble}>
            <Text style={styles.matchText}>{t("match.title")}</Text>
          </View>
        </Animated.View>

        {/* Images Container */}
        <View style={styles.imagesContainer}>
          {/* Left Image (Current User) - Using absolute positioning with transform */}
          <Animated.View
            style={[
              styles.leftImageWrapper,
              {
                transform: [{ translateX: leftImageX }],
              },
            ]}
          >
            <Animated.Image
              source={{ uri: matchData.currentUser.image }}
              style={[
                styles.userImage,
                {
                  transform: [
                    { rotate: leftRotation },
                    { scale: leftImageScale },
                  ],
                },
              ]}
            />
            <View style={styles.imageGlow} />
          </Animated.View>

          {/* Center Heart with Lottie */}
          <Animated.View
            style={[
              styles.centerHeartContainer,
              {
                transform: [{ scale: heartContainerScale }],
              },
            ]}
          >
            <View style={styles.heartBackground}>
              <LottieView
                ref={heartBeatRef}
                style={styles.heartBeatAnimation}
                source={require("@/assets/animations/confetti.json")}
                autoPlay={false}
                loop={true}
                speed={0.8}
              />
              <View style={styles.heartIcon}>{svgIcon.Heart}</View>
            </View>
          </Animated.View>

          {/* Right Image (Matched User) - Using absolute positioning with transform */}
          <Animated.View
            style={[
              styles.rightImageWrapper,
              {
                transform: [{ translateX: rightImageX }],
              },
            ]}
          >
            <Animated.Image
              source={{ uri: matchData.matchedUser.image }}
              style={[
                styles.userImage,
                {
                  transform: [
                    { rotate: rightRotation },
                    { scale: rightImageScale },
                  ],
                },
              ]}
            />
            <View style={styles.imageGlow} />
          </Animated.View>
        </View>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
          },
        ]}
      >
        <Text style={styles.messageText}>
          {t("match.description")}
          {"\n"}
          <Text style={styles.nameText}>
            {matchData.matchedUser.name}
            {matchData.matchedUser.age > 0
              ? `, ${matchData.matchedUser.age}`
              : ""}
          </Text>
        </Text>
        <Text style={styles.distanceText}>
          <SimpleLineIcons name="location-pin" size={14} color={color.gray55} />{" "}
          {matchData.matchedUser.distance}
        </Text>
        <CustomButton
          title={t("meetups.requestMeetup")}
          onPress={handleRequestMeetup}
        />

        <TouchableOpacity
          style={styles.keepExploringButton}
          onPress={handleKeepExploring}
        >
          <Text style={styles.keepExploringText}>
            {t("meetups.keepExploring")}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Request Meetup Modal */}
      <Modal
        visible={showRequestMeetup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRequestMeetup(false)}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowRequestMeetup(false)}
          />
          <RequestMeetup
            onClose={() => setShowRequestMeetup(false)}
            onSubmit={handleSubmitMeetupRequest}
            matchData={{
              id: matchData.matchedUser.id,
              name: matchData.matchedUser.name,
              image: matchData.matchedUser.image,
              distance: matchData.matchedUser.distance,
              matchedTime: "Just now",
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  // Lottie Animation Styles
  confettiAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: "none",
  },
  backgroundHeartsAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: "none",
  },
  sparklesAnimation: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.3,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 15,
    pointerEvents: "none",
  },
  celebrationAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 12,
    pointerEvents: "none",
  },
  heartBeatAnimation: {
    width: 80,
    height: 80,
    position: "absolute",
  },
  blurLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
  },
  matchContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: -80,
    zIndex: 15,
  },
  matchTextContainer: {
    marginBottom: 50,
    zIndex: 20,
  },
  matchBubble: {
    backgroundColor: color.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  matchText: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.white,
    letterSpacing: 0.5,
  },
  imagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 220,
    zIndex: 10,
  },
  // iOS-Compatible Image Wrappers with absolute positioning
  leftImageWrapper: {
    position: "absolute",
    left: 0,
    top: 20,
    zIndex: 5,
  },
  rightImageWrapper: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 5,
  },
  userImage: {
    width: 150,
    height: 200,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: color.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  imageGlow: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 29,
    backgroundColor: color.primary,
    opacity: 0.1,
    zIndex: -1,
  },
  centerHeartContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 25,
  },
  heartBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heartIcon: {
    position: "absolute",
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
    zIndex: 15,
  },
  messageText: {
    fontSize: 24,
    fontFamily: font.regular,
    color: color.black,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 32,
  },
  nameText: {
    fontSize: 24,
    fontFamily: font.semiBold,
    color: color.primary,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginBottom: 24,
  },
  keepExploringButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  keepExploringText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
