import CustomButton from "@/components/custom_button";
import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  let matchData;
  try {
    matchData = params?.matchData
      ? JSON.parse(params.matchData as string)
      : route?.params?.matchData;
  } catch (error) {

    matchData = null;
  }

  const finalMatchData = matchData || {
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

  // const matchData = route?.params?.matchData || {
  //   currentUser: {
  //     name: "You",
  //     image:
  //       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  //   },
  //   matchedUser: {
  //     name: "Julia",
  //     age: 24,
  //     distance: "1.2 km away",
  //     image:
  //       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  //   },
  // };

  // Animation values
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const leftImageAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const rightImageAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const leftImageRotate = useRef(new Animated.Value(0)).current;
  const rightImageRotate = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;
  const matchTextScale = useRef(new Animated.Value(0)).current;
  const matchTextY = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Background hearts state with individual animations
  const [backgroundHearts, setBackgroundHearts] = useState([]);
  const heartAnimations = useRef({}).current;

  useEffect(() => {
    // Generate random background hearts with different groups
    const hearts = Array.from({ length: 20 }, (_, i) => {
      const animValue = new Animated.Value(0);
      heartAnimations[i] = animValue;

      return {
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        startY: SCREEN_HEIGHT + Math.random() * 300,
        size: 15 + Math.random() * 35,
        opacity: 0.1 + Math.random() * 0.4,
        duration: 5000 + Math.random() * 5000, // 5-10 seconds
        delay: Math.random() * 4000, // Start within first 4 seconds
        group: Math.floor(Math.random() * 5), // Groups 0-4
      };
    });
    setBackgroundHearts(hearts);

    // Start the animation sequence
    startAnimationSequence();

    // Start background hearts animations in groups
    startBackgroundHeartsAnimation(hearts);
  }, []);

  const startBackgroundHeartsAnimation = (hearts) => {
    // Group hearts and start animations
    const groups = {};
    hearts.forEach((heart) => {
      if (!groups[heart.group]) groups[heart.group] = [];
      groups[heart.group].push(heart);
    });

    // Start each group with different delays
    Object.keys(groups).forEach((groupKey, index) => {
      const groupDelay = index * 800; // Stagger groups by 800ms

      groups[groupKey].forEach((heart) => {
        setTimeout(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(heartAnimations[heart.id], {
                toValue: 1,
                duration: heart.duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(heartAnimations[heart.id], {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }, groupDelay + heart.delay);
      });
    });
  };

  const startAnimationSequence = () => {
    // 1. Blur layer appears
    setTimeout(() => {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 300);

    // 2. Images slide in from sides with rotation
    setTimeout(() => {
      Animated.parallel([
        // Left image slide
        Animated.spring(leftImageAnim, {
          toValue: SCREEN_WIDTH * 0.15,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Left image rotation
        Animated.spring(leftImageRotate, {
          toValue: -8, // -8 degrees rotation
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Right image slide
        Animated.spring(rightImageAnim, {
          toValue: -SCREEN_WIDTH * 0.15,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Right image rotation
        Animated.spring(rightImageRotate, {
          toValue: 8, // 8 degrees rotation
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // 3. Heart appears with special effect
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(heartScale, {
          toValue: 1,
          tension: 150,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start continuous pulse animation after heart appears
        Animated.loop(
          Animated.sequence([
            Animated.timing(heartPulse, {
              toValue: 1.2,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(heartPulse, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Sparkle effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1500);

    // 4. "It's a Match" text appears and moves up
    setTimeout(() => {
      Animated.sequence([
        Animated.spring(matchTextScale, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(matchTextY, {
          toValue: -50,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    // 5. Content appears
    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 2800);
  };

  const handleBack = () => {
    router.back();
  };

  const handleOptions = () => {};

  const handleViewProfile = () => {
    if (finalMatchData.matchedUser.id) {
      router.push({
        pathname: "/profile/user_profile",
        params: {
          userId: finalMatchData.matchedUser.id,
          user: JSON.stringify(finalMatchData.matchedUser),
        },
      });
    } else {
      router.push("/profile/user_profile");
    }
  };

  const handleKeepExploring = () => {
    router.back();
  };

  const HeartIcon = ({ style }) => (
    <Text style={[{ fontSize: 30, color: "#FF6B6B" }, style]}>
      {svgIcon.Lovely}
    </Text>
  );

  const SparkleIcon = ({ style }) => (
    <Text style={[{ fontSize: 20, color: "#FFD700" }, style]}>✨</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Hearts */}
      <View style={styles.backgroundContainer}>
        {backgroundHearts.map((heart) => (
          <Animated.View
            key={heart.id}
            style={[
              styles.backgroundHeart,
              {
                left: heart.x,
                transform: [
                  {
                    translateY:
                      heartAnimations[heart.id]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [heart.startY, -100],
                      }) || 0,
                  },
                  {
                    rotate:
                      heartAnimations[heart.id]?.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: ["0deg", "15deg", "-15deg"],
                      }) || "0deg",
                  },
                  {
                    scale:
                      heartAnimations[heart.id]?.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.1, 0.9],
                      }) || 1,
                  },
                ],
                opacity:
                  heartAnimations[heart.id]?.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, heart.opacity, heart.opacity, 0],
                  }) || 0,
              },
            ]}
          >
            <HeartIcon style={{ fontSize: heart.size }} />
          </Animated.View>
        ))}
      </View>

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
        <Text style={styles.headerTitle}>{t("match.title")}</Text>
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
            <Text style={styles.matchText}>{t("match.subtitle")}</Text>
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
                  {
                    rotate: leftImageRotate.interpolate({
                      inputRange: [-8, -8],
                      outputRange: ["-8deg", "-8deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: finalMatchData.matchedUser.image }}
              style={styles.userImage}
            />
            <View style={styles.sparkleContainer}>
              <Animated.View
                style={[
                  styles.sparkle,
                  styles.sparkle1,
                  {
                    opacity: sparkleAnim,
                    transform: [
                      {
                        scale: sparkleAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <SparkleIcon />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Center Heart */}
          <Animated.View
            style={[
              styles.centerHeart,
              {
                opacity: heartOpacity,
                transform: [
                  { scale: Animated.multiply(heartScale, heartPulse) },
                ],
              },
            ]}
          >
            {svgIcon.Heart}
          </Animated.View>

          {/* Right Image (Matched User) */}
          <Animated.View
            style={[
              styles.imageWrapper,
              styles.rightImage,
              {
                transform: [
                  { translateX: rightImageAnim },
                  {
                    rotate: rightImageRotate.interpolate({
                      inputRange: [8, 8],
                      outputRange: ["8deg", "8deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: finalMatchData.currentUser.image }}
              style={styles.userImage}
            />
            <View style={styles.sparkleContainer}>
              <Animated.View
                style={[
                  styles.sparkle,
                  styles.sparkle2,
                  {
                    opacity: sparkleAnim,
                    transform: [
                      {
                        scale: sparkleAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <SparkleIcon />
              </Animated.View>
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
          {t("match.description")}
          {"\n"}
          <Text style={styles.nameText}>
            {matchData.matchedUser.name}, {matchData.matchedUser.age}
          </Text>
        </Text>
        <Text style={styles.distanceText}>
          <SimpleLineIcons name="location-pin" size={14} color={color.gray55} />{" "}
          {matchData.matchedUser.distance}
        </Text>
        <CustomButton
          title={t("match.viewProfile", { name: matchData.matchedUser.name })}
          onPress={handleViewProfile}
        />

        <TouchableOpacity
          style={styles.keepExploringButton}
          onPress={handleKeepExploring}
        >
          <Text style={styles.keepExploringText}>
            {t("match.keepExploring")}
          </Text>
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
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundHeart: {
    position: "absolute",
  },
  blurLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
    paddingTop: -100,
  },
  matchTextContainer: {
    marginBottom: 40,
  },
  matchBubble: {
    backgroundColor: color.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  matchText: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.white,
  },
  imagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 200,
  },
  imageWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  leftImage: {
    position: "absolute",
    top: 40,
    left: 0,
  },
  rightImage: {
    position: "absolute",
    right: 0,
  },
  userImage: {
    width: 160,
    height: 210,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: color.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sparkleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: "absolute",
  },
  sparkle1: {
    top: -10,
    right: -10,
  },
  sparkle2: {
    bottom: -10,
    left: -10,
  },
  centerHeart: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  messageText: {
    fontSize: 24,
    fontFamily: font.regular,
    color: color.black,
    textAlign: "center",
    marginBottom: 8,
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
    marginBottom: 22,
  },
  viewProfileButton: {
    backgroundColor: "#5FB3D4",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  viewProfileText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
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
