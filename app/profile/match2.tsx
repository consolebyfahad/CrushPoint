import CustomButton from "@/components/custom_button";
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
  Animated,
  Dimensions,
  Easing,
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
  
  let matchData;
  const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face";
  const getCurrentUserImageFromContext = (): string => {
    if (
      userData?.photos &&
      Array.isArray(userData.photos) &&
      userData.photos.length > 0
    ) {
      return userData.photos[0];
    }
    if (
      userData?.images &&
      Array.isArray(userData.images) &&
      userData.images.length > 0
    ) {
      const first = userData.images[0];
      const url =
        typeof first === "string" && first.startsWith("http")
          ? first
          : `https://api.andra-dating.com/images/${typeof first === "string" ? first.replace(/\\/g, "") : first}`;
      return url;
    }
    return userData?.gender === "female"
      ? "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg"
      : "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
  };

  try {
    if (params?.matchData) {
      matchData = JSON.parse(params.matchData as string);

      if (
        matchData.currentUser?.image &&
        matchData.currentUser.image.includes("[")
      ) {
        const imageMatch = matchData.currentUser.image.match(/\["([^"]+)"\]/);
        if (imageMatch?.[1]) {
          matchData.currentUser.image = `https://api.andra-dating.com/images/${imageMatch[1]}`;
        } else {
          matchData.currentUser.image = "";
        }
      }

      // Prefer context for current user image so we show the real profile photo, not a placeholder
      matchData.currentUser = matchData.currentUser || {};
      matchData.currentUser.image = getCurrentUserImageFromContext();

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
          matchedUserCoords,
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
          name: userData?.name || "You",
          image: getCurrentUserImageFromContext(),
          lat: userData?.lat ?? "",
          lng: userData?.lng ?? "",
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

  const confettiRef = useRef<LottieView>(null);
  const heartsRef = useRef<LottieView>(null);
  const sparklesRef = useRef<LottieView>(null);
  const celebrationRef = useRef<LottieView>(null);
  const heartBeatRef = useRef<LottieView>(null);

  const blurOpacity = useRef(new Animated.Value(0)).current;

  const leftImageX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const leftImageRotate = useRef(new Animated.Value(0)).current;
  const leftImageScale = useRef(new Animated.Value(0.8)).current;

  const rightImageX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const rightImageRotate = useRef(new Animated.Value(0)).current;
  const rightImageScale = useRef(new Animated.Value(0.8)).current;

  const matchTextScale = useRef(new Animated.Value(0)).current;
  const matchTextY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const heartContainerScale = useRef(new Animated.Value(0)).current;

  const [showLottieAnimations, setShowLottieAnimations] = useState(false);

  useEffect(() => {
    startAnimationSequence();
  }, []);

  const startAnimationSequence = () => {
    
    setTimeout(() => {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 200);

    setTimeout(() => {
      setShowLottieAnimations(true);
      
      confettiRef.current?.play();
      
      heartsRef.current?.play();
    }, 500);

    setTimeout(() => {
      Animated.parallel([
        
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

    setTimeout(() => {
      Animated.spring(heartContainerScale, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }).start(() => {
        
        heartBeatRef.current?.play();
      });
    }, 1200);

    setTimeout(() => {
      sparklesRef.current?.play();
    }, 1400);

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

    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 2200);

    setTimeout(() => {
      celebrationRef.current?.play();
    }, 2000);
  };

  const handleChat = async () => {
    
    let matchRecordId = "";
    if (user?.user_id && matchData?.matchedUser?.id) {
      try {
        const formData = new FormData();
        formData.append("type", "get_data");
        formData.append("table_name", "matches");
        formData.append("user_id", user.user_id);

        const response = await apiCall(formData);
        if (response?.data && Array.isArray(response.data)) {
          const matchRecord = response.data.find(
            (m: any) =>
              m.match_id === matchData.matchedUser.id ||
              m.match?.id === matchData.matchedUser.id,
          );
          if (matchRecord) {
            matchRecordId = matchRecord.id;  
          }
        }
      } catch (error) {}
    }

    router.push({
      pathname: "/chat/conversation",
      params: {
        matchId: matchRecordId || matchData?.matchedUser?.id || "",
        userId: matchData?.matchedUser?.id || "",
        userName: matchData?.matchedUser?.name || "",
        userImage: matchData?.matchedUser?.image || "",
        userAge:
          matchData?.matchedUser?.age != null
            ? String(matchData.matchedUser.age)
            : undefined,
        userTimeAgo: matchData?.matchedUser?.timeAgo ?? undefined,
      },
    });
  };

  const handleKeepExploring = () => {
    router.push({
      pathname: "/(tabs)",
      params: {
        activeTab: "matches",
      },
    });
  };

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
      {}
      {showLottieAnimations && (
        <>
          {}
          <LottieView
            ref={confettiRef}
            style={styles.confettiAnimation}
            source={require("@/assets/animations/confetti.json")}
            autoPlay={false}
            loop={false}
            speed={1.2}
          />

          {}
          <LottieView
            ref={heartsRef}
            style={styles.backgroundHeartsAnimation}
            source={require("@/assets/animations/floating-hearts.json")}
            autoPlay={false}
            loop={true}
            speed={0.8}
          />

          {}
          <LottieView
            ref={sparklesRef}
            style={styles.sparklesAnimation}
            source={require("@/assets/animations/confetti.json")}
            autoPlay={false}
            loop={true}
            speed={1.5}
          />

          {}
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

      {}
      <Animated.View
        style={[
          styles.blurLayer,
          {
            opacity: blurOpacity,
          },
        ]}
      />

      {}
      <View style={styles.header}>
        {}
        {}
        {}
      </View>

      {}
      <View style={styles.matchContainer}>
        {}
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

        {}
        <View style={styles.imagesContainer}>
          {}
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

          {}
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

          {}
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

      {}
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
        <CustomButton title={t("chat.letsChat")} onPress={handleChat} />

        <TouchableOpacity
          style={styles.keepExploringButton}
          onPress={handleKeepExploring}
        >
          <Text style={styles.keepExploringText}>
            {t("meetups.keepExploring")}
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
