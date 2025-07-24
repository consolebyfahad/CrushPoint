import CustomButton from "@/components/custom_button";
import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MatchScreen({ route, navigation }: any) {
  const matchData = route?.params?.matchData || {
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

  // Animation refs
  const confettiRef = useRef(null);
  const heartsRef = useRef(null);
  const sparklesRef = useRef(null);
  const celebrationRef = useRef(null);
  const heartBeatRef = useRef(null);

  // Animation values
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const leftImageAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const rightImageAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const leftImageRotate = useRef(new Animated.Value(0)).current;
  const rightImageRotate = useRef(new Animated.Value(0)).current;
  const leftImageScale = useRef(new Animated.Value(0.8)).current;
  const rightImageScale = useRef(new Animated.Value(0.8)).current;
  const matchTextScale = useRef(new Animated.Value(0)).current;
  const matchTextY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const heartContainerScale = useRef(new Animated.Value(0)).current;

  // State for controlling animations
  const [showLottieAnimations, setShowLottieAnimations] = useState(false);

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
        Animated.spring(leftImageAnim, {
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
        Animated.spring(rightImageAnim, {
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

  const handleOptions = () => {
    console.log("Options pressed");
  };

  const handleViewProfile = () => {
    router.push("/profile/user_profile");
  };

  const handleKeepExploring = () => {
    router.back();
  };

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
            source={require("@/assets/animations/confetti.json")} // You'll need to add this
            autoPlay={false}
            loop={true}
            speed={1.5}
          />

          {/* Celebration particles */}
          <LottieView
            ref={celebrationRef}
            style={styles.celebrationAnimation}
            source={require("@/assets/animations/confetti.json")} // You'll need to add this
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
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>It's a Match</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleOptions}>
          <Ionicons name="ellipsis-vertical" size={24} color={color.black} />
        </TouchableOpacity>
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
            <Text style={styles.matchText}>{"It's a Match"}</Text>
          </View>
        </Animated.View>

        {/* Images Container */}
        <View style={styles.imagesContainer}>
          {/* Left Image (Current User) */}
          <Animated.View
            style={[
              styles.imageWrapper,
              styles.leftImage,
              {
                transform: [
                  { translateX: leftImageAnim },
                  { scale: leftImageScale },
                  {
                    rotate: leftImageRotate.interpolate({
                      inputRange: [-12, -12],
                      outputRange: ["-12deg", "-12deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: matchData.currentUser.image }}
                style={styles.userImage}
              />
              <View style={styles.imageGlow} />
            </View>
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
                source={require("@/assets/animations/confetti.json")} // You'll need to add this
                autoPlay={false}
                loop={true}
                speed={0.8}
              />
              <View style={styles.heartIcon}>{svgIcon.Heart}</View>
            </View>
          </Animated.View>

          {/* Right Image (Matched User) */}
          <Animated.View
            style={[
              styles.imageWrapper,
              styles.rightImage,
              {
                transform: [
                  { translateX: rightImageAnim },
                  { scale: rightImageScale },
                  {
                    rotate: rightImageRotate.interpolate({
                      inputRange: [12, 12],
                      outputRange: ["12deg", "12deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: matchData.matchedUser.image }}
                style={styles.userImage}
              />
              <View style={styles.imageGlow} />
            </View>
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
          Forget chatting, go talk to{"\n"}
          <Text style={styles.nameText}>
            {matchData.matchedUser.name}, {matchData.matchedUser.age}
          </Text>
        </Text>
        <Text style={styles.distanceText}>
          <SimpleLineIcons name="location-pin" size={14} color={color.gray55} />{" "}
          {matchData.matchedUser.distance}
        </Text>
        <CustomButton
          title={`View ${matchData.matchedUser.name}'s Profile`}
          onPress={handleViewProfile}
        />

        <TouchableOpacity
          style={styles.keepExploringButton}
          onPress={handleKeepExploring}
        >
          <Text style={styles.keepExploringText}>Keep Exploring</Text>
        </TouchableOpacity>
      </Animated.View>
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
  imageWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  leftImage: {
    position: "absolute",
    top: 20,
    left: 0,
  },
  rightImage: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  imageContainer: {
    position: "relative",
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
});
