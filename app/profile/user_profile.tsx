import BlockConfirmation from "@/components/block_option";
import ProfileOptions from "@/components/profile_options";
import ReportUser from "@/components/report_user";
import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function UserProfile({ route, navigation }: any) {
  const user = route?.params?.user || {
    id: "3",
    name: "Julia",
    age: 24,
    distance: "1.2 km",
    isOnline: true,
    lookingFor: ["Serious relationship", "Friendship"],
    interests: ["Travel", "Art", "Cooking", "Fashion", "Music", "Wine"],
    height: "175 cm",
    nationality: "Canadian",
    religion: "Christian",
    zodiac: "Leo",
    images: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
    ],
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);

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
      default:
        return "🎯";
    }
  };

  const getLookingForIcon = (lookingFor: string) => {
    if (lookingFor.toLowerCase().includes("serious")) {
      return "🔥";
    } else if (lookingFor.toLowerCase().includes("casual")) {
      return "😊";
    } else if (lookingFor.toLowerCase().includes("friendship")) {
      return "🤝";
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
    console.log("Emoji action:", action);
  };

  const handleBlock = () => {
    setShowProfileOptions(false); // Hide profile options
    setShowBlockConfirmation(true); // Show block confirmation
  };

  const handleConfirmBlock = () => {
    console.log("Block user:", user.name);
    // Handle block logic here
    setShowBlockConfirmation(false);
    // navigation.goBack(); // Go back after blocking
  };

  const handleReport = () => {
    setShowProfileOptions(false); // Hide profile options
    setShowReportUser(true); // Show report modal
  };

  const handleSubmitReport = (reportData: any) => {
    console.log("Report submitted:", reportData);
    // Handle report submission logic here
    setShowReportUser(false);
    // Show success message or navigate back
  };

  const handleBackToProfileOptions = () => {
    setShowBlockConfirmation(false); // Hide block confirmation
    setShowReportUser(false); // Hide report modal
    setShowProfileOptions(true); // Show profile options again
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
              {user.name}, {user.age}
            </Text>
          </View>
          <View style={styles.distanceContainer}>
            <SimpleLineIcons
              name="location-pin"
              size={14}
              color={color.gray300}
            />
            <Text style={styles.distance}>{user.distance}</Text>
          </View>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Feather name="map" size={20} color="black" />
            {/* <Ionicons name="bookmark-outline" size={20} color={color.black} /> */}
          </TouchableOpacity>
        </View>

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

        {/* Other Information */}
        <View style={styles.section}>
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
          image: user.images ? user.images[0] : user.image,
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
    alignItems: "center",
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
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray300,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: color.white300,
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
