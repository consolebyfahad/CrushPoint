import BlockConfirmation from "@/components/block_option";
import ProfileOptions from "@/components/profile_options";
import ReportUser from "@/components/report_user";
import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function UserProfile() {
  const params = useLocalSearchParams();
  console.log("params", params);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);

  // Parse user data from params with fallback
  const userData = useMemo(() => {
    try {
      if (params.user && typeof params.user === "string") {
        const parsed = JSON.parse(params.user);
        console.log("Parsed user data:", parsed);
        return parsed;
      }
      console.log("No user data found in params");
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }, [params.user]);

  // Helper function to calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    try {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch (error) {
      return null;
    }
  };

  // Helper function to parse comma-separated strings to arrays
  const parseStringToArray = (str: any) => {
    if (!str || typeof str !== "string" || str.trim() === "") return [];
    return str
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // Helper function to parse images
  const parseImages = (imagesString: any) => {
    if (
      !imagesString ||
      typeof imagesString !== "string" ||
      imagesString.trim() === ""
    ) {
      // Return default avatar if no images
      return [
        "https://via.placeholder.com/400x600/E5E5E5/999999?text=No+Photo",
      ];
    }

    const imageArray = parseStringToArray(imagesString);
    if (imageArray.length === 0) {
      return [
        "https://via.placeholder.com/400x600/E5E5E5/999999?text=No+Photo",
      ];
    }

    return imageArray;
  };

  // Helper function to format height
  const formatHeight = (heightString: any) => {
    if (
      !heightString ||
      typeof heightString !== "string" ||
      heightString === ""
    )
      return "Not specified";

    // Convert from mm to cm if the value is large (assuming API returns mm)
    const heightNum = parseInt(heightString);
    if (isNaN(heightNum)) return "Not specified";

    if (heightNum > 300) {
      return `${(heightNum / 10).toFixed(0)} cm`;
    }
    return `${heightNum} cm`;
  };

  // Calculate distance (placeholder - you'd need actual user location and target user location)
  const calculateDistance = (lat: any, lng: any) => {
    // Placeholder distance calculation
    // In real app, you'd calculate using current user's location and target user's location
    if (!lat || !lng || typeof lat !== "string" || typeof lng !== "string")
      return "-- km";
    return "2.5 km"; // Placeholder
  };

  // Map API data to component structure
  const user = useMemo(() => {
    if (!userData || typeof userData !== "object") {
      console.log("No valid user data available, using fallback");
      // Fallback data if no user provided
      return {
        id: "unknown",
        name: "Unknown User",
        age: 0,
        distance: "-- km",
        isOnline: false,
        lookingFor: [],
        interests: [],
        height: "Not specified",
        nationality: "Not specified",
        religion: "Not specified",
        zodiac: "Not specified",
        about: "",
        images: [
          "https://via.placeholder.com/400x600/E5E5E5/999999?text=No+Photo",
        ],
      };
    }

    const age = calculateAge(userData.dob);
    const images = parseImages(userData.images);
    const interests = parseStringToArray(userData.interests);
    const lookingFor = parseStringToArray(userData.looking_for);
    const distance = calculateDistance(userData.lat, userData.lng);

    return {
      id: userData.id || "unknown",
      name: userData.name || "Unknown User",
      age: age || 0,
      distance: distance,
      isOnline: userData.status === "1", // Assuming status "1" means online
      lookingFor: lookingFor.length > 0 ? lookingFor : ["Not specified"],
      interests: interests.length > 0 ? interests : ["No interests listed"],
      height: formatHeight(userData.height),
      nationality: userData.nationality || "Not specified",
      religion: userData.religion || "Not specified",
      zodiac: userData.zodiac || "Not specified",
      about: userData.about || "",
      email: userData.email || "",
      gender: userData.gender || "Not specified",
      country: userData.country || "Not specified",
      state: userData.state || "Not specified",
      city: userData.city || "Not specified",
      languages: parseStringToArray(userData.languages),
      images: images,
    };
  }, [userData]);

  const handleBack = () => {
    router.back();
  };

  const handleOptions = () => {
    setShowProfileOptions(true);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? user.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === user.images.length - 1 ? 0 : prev + 1
    );
  };

  const getInterestIcon = (interest: string) => {
    switch (interest.toLowerCase()) {
      case "travel":
        return "✈️";
      case "art":
        return "🎨";
      case "cooking":
        return "🍳";
      case "fashion":
        return "👗";
      case "music":
        return "🎵";
      case "wine":
        return "🍷";
      case "coffee":
        return "☕";
      case "hiking":
        return "🥾";
      case "photography":
        return "📸";
      case "fitness":
        return "💪";
      case "reading":
        return "📚";
      case "sports":
        return "⚽";
      case "movies":
        return "🎬";
      case "dancing":
        return "💃";
      case "gaming":
        return "🎮";
      default:
        return "🎯";
    }
  };

  const getLookingForIcon = (lookingFor: string) => {
    if (lookingFor.toLowerCase().includes("serious")) {
      return "💕";
    } else if (lookingFor.toLowerCase().includes("casual")) {
      return "😊";
    } else if (lookingFor.toLowerCase().includes("friendship")) {
      return "🤝";
    } else if (lookingFor.toLowerCase().includes("relationship")) {
      return "💖";
    } else {
      return "💫";
    }
  };

  const actionEmojis = [
    { emoji: svgIcon.Like, action: "like", color: "#3B82F6" },
    { emoji: svgIcon.Fire, action: "super_like", color: "#F59E0B" },
    { emoji: svgIcon.Blink, action: "smile", color: "#10B981" },
    { emoji: svgIcon.Tea, action: "message", color: "#8B5CF6" },
    { emoji: svgIcon.Hi, action: "friend", color: "#F97316" },
  ];

  const handleEmojiAction = (action: string) => {
    if (action === "like") {
      router.push("/profile/match");
    }
    console.log("Emoji action:", action, "for user:", user.name);
  };

  const handleBlock = () => {
    setShowProfileOptions(false);
    setShowBlockConfirmation(true);
  };

  const handleConfirmBlock = () => {
    console.log("Block user:", user.name);
    // Handle block logic here
    setShowBlockConfirmation(false);
    router.back();
  };

  const handleReport = () => {
    setShowProfileOptions(false);
    setShowReportUser(true);
  };

  const handleSubmitReport = (reportData: any) => {
    console.log("Report submitted:", reportData);
    // Handle report submission logic here
    setShowReportUser(false);
    // Show success message or navigate back
  };

  const handleBackToProfileOptions = () => {
    setShowBlockConfirmation(false);
    setShowReportUser(false);
    setShowProfileOptions(true);
  };

  return (
    <View style={styles.container}>
      {/* Image Slider */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: user.images[currentImageIndex] }}
          style={styles.profileImage}
        />

        {/* Navigation Overlay */}
        <View style={styles.imageOverlay}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={color.white} />
          </TouchableOpacity>
          {/* Image Indicators */}
          {user.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {user.images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
          {/* Options Button */}
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={handleOptions}
            activeOpacity={0.8}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={color.white} />
          </TouchableOpacity>
        </View>

        {/* Image Navigation Areas */}
        {user.images.length > 1 && (
          <>
            <TouchableOpacity
              style={styles.leftImageArea}
              onPress={handlePreviousImage}
              activeOpacity={0.1}
            />
            <TouchableOpacity
              style={styles.rightImageArea}
              onPress={handleNextImage}
              activeOpacity={0.1}
            />
          </>
        )}

        {/* Action Emojis */}
        <View style={styles.actionEmojis}>
          {actionEmojis.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiButton}
              onPress={() => handleEmojiAction(item.action)}
              activeOpacity={0.8}
            >
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Profile Info */}
      <ScrollView
        style={styles.profileInfo}
        showsVerticalScrollIndicator={false}
      >
        {/* Name, Age, Distance */}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>
              {user.name}
              {user.age > 0 ? `, ${user.age}` : ""}
            </Text>
            {user.isOnline && (
              <View style={styles.onlineIndicator}>
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
          </View>
          <View style={styles.distanceContainer}>
            <SimpleLineIcons
              name="location-pin"
              size={14}
              color={color.gray55}
            />
            <Text style={styles.distance}>{user.distance}</Text>
          </View>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Feather name="bookmark" size={20} color={color.black} />
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        {(user.city || user.state || user.country) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {[user.city, user.state, user.country]
                  .filter(Boolean)
                  .join(", ") || "Not specified"}
              </Text>
            </View>
          </View>
        )}

        {/* About Section */}
        {user.about && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{user.about}</Text>
          </View>
        )}

        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking for</Text>
          <View style={styles.lookingForContainer}>
            {user.lookingFor.map((item: string, index: number) => (
              <View key={index} style={styles.lookingForTag}>
                <Text style={styles.lookingForIcon}>
                  {getLookingForIcon(item)}
                </Text>
                <Text style={styles.lookingForText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {user.interests.map((interest: string, index: number) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestIcon}>
                  {getInterestIcon(interest)}
                </Text>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Languages */}
        {user.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.interestsContainer}>
              {user.languages.map((language: string, index: number) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Other Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{user.height}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nationality</Text>
            <Text style={styles.infoValue}>{user.nationality}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Religion</Text>
            <Text style={styles.infoValue}>{user.religion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Zodiac</Text>
            <Text style={styles.infoValue}>{user.zodiac}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{user.gender}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Profile Options Modal */}
      <ProfileOptions
        visible={showProfileOptions}
        onClose={() => setShowProfileOptions(false)}
        onBlock={handleBlock}
        onReport={handleReport}
        userData={{
          name: user.name,
          age: user.age,
          image: user.images[0],
        }}
        isMatch={false}
      />

      {/* Block Confirmation Modal */}
      <BlockConfirmation
        visible={showBlockConfirmation}
        onClose={() => setShowBlockConfirmation(false)}
        onBack={handleBackToProfileOptions}
        onConfirm={handleConfirmBlock}
        userName={user.name}
      />

      {/* Report User Modal */}
      <ReportUser
        visible={showReportUser}
        onClose={() => setShowReportUser(false)}
        onBack={handleBackToProfileOptions}
        onSubmit={handleSubmitReport}
        userName={user.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.55,
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  leftImageArea: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SCREEN_WIDTH / 2,
    height: "100%",
  },
  rightImageArea: {
    position: "absolute",
    right: 0,
    top: 0,
    width: SCREEN_WIDTH / 2,
    height: "100%",
  },
  imageIndicators: {
    position: "absolute",
    top: 20,
    left: 120,
    right: 120,
    flexDirection: "row",
    gap: 6,
    zIndex: 5,
  },
  indicator: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  activeIndicator: {
    backgroundColor: color.white,
  },
  actionEmojis: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    zIndex: 5,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiText: {
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nameSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  nameRow: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  onlineIndicator: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  onlineText: {
    fontSize: 12,
    fontFamily: font.medium,
    color: color.white,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginRight: 8,
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 24,
  },
  lookingForContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lookingForTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5FB3D4",
  },
  lookingForIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  lookingForText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#5FB3D4",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  interestText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
  },
  languageTag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  languageText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#6366F1",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: color.gray97,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: font.medium,
    color: "#5FB3D4",
  },
});
