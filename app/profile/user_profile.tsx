import BlockConfirmation from "@/components/block_option";
import ProfileOptions from "@/components/profile_options";
import ReportUser from "@/components/report_user";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
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
  const { user } = useAppContext();
  const params = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);

  // Parse user data from params with fallback
  const userData = useMemo(() => {
    try {
      if (params.user && typeof params.user === "string") {
        const parsed = JSON.parse(params.user);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }, [params.user]);

  // Map API data to component structure
  const userInfo = useMemo(() => {
    if (!userData || typeof userData !== "object") {
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

    return {
      id: userData.id || "unknown",
      name: userData.name || "Unknown User",
      age: userData.age || 0,
      distance: "2.5 km", // or calculate as needed
      isOnline: userData.isOnline || true,
      lookingFor: userData.lookingFor || [],
      interests: userData.interests || [],
      height: userData.height || "Not specified",
      nationality: userData.nationality || "Not specified",
      religion: userData.religion || "Not specified",
      zodiac: userData.zodiac || "Not specified",
      about: userData.about || "This is me",
      email: userData.email || "",
      gender:
        userData.gender === "female"
          ? "Female"
          : userData.gender || "Not specified",
      country: userData.country || "Not specified",
      state: userData.state || "Not specified",
      city: userData.city || "Not specified",
      languages: userData.languages ? userData.languages.split(",") : [],
      images:
        userData.images && userData.images.length > 0
          ? userData.images
          : ["https://via.placeholder.com/400x600/E5E5E5/999999?text=No+Photo"],
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
      prev === 0 ? userInfo.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === userInfo.images.length - 1 ? 0 : prev + 1
    );
  };

  const actionEmojis = [
    { emoji: svgIcon.Like, action: "like", color: "#3B82F6" },
    { emoji: svgIcon.Fire, action: "super_like", color: "#F59E0B" },
    { emoji: svgIcon.Blink, action: "smile", color: "#10B981" },
    { emoji: svgIcon.Tea, action: "message", color: "#8B5CF6" },
    { emoji: svgIcon.Hi, action: "friend", color: "#F97316" },
  ];

  const handleEmojiAction = async (action: string) => {
    try {
      const formData = new FormData();
      formData.append("type", "add_data"),
        formData.append("table_name", "matches"),
        formData.append("match_id", userInfo.id),
        formData.append("user_id", user?.user_id || ""),
        formData.append("emoji", action);
      const response = await apiCall(formData);
      if (response.result) {
      }
    } catch (error) {}
    // if (action === "like") {
    //   router.push("/profile/match");
    // }
    console.log("Emoji action:", action, "for user:", userInfo.name);
  };

  const handleBlock = () => {
    setShowProfileOptions(false);
    setShowBlockConfirmation(true);
  };

  const handleConfirmBlock = async () => {
    console.log("Block user:", userInfo.name);
    // Handle block logic here
    try {
      const formData = new FormData();
      formData.append("type", "add_data"),
        formData.append("table_name", "blocked_users"),
        formData.append("block_id", userInfo.id),
        formData.append("user_id", user?.user_id || ""),
        console.log("formData", formData);
      const response = await apiCall(formData);
      if (response.result) {
        setShowBlockConfirmation(false);
        // router.back();
      }
    } catch (error) {}
  };

  const handleReport = () => {
    setShowProfileOptions(false);
    setShowReportUser(true);
  };

  const handleSubmitReport = async (reportData: any) => {
    console.log("Report submitted:", reportData);
    try {
      const formData = new FormData();
      formData.append("type", "add_data"),
        formData.append("table_name", "reported_users"),
        formData.append("block_id", userInfo.id),
        formData.append("additional_details", reportData.additionalDetails),
        formData.append("reason", reportData.reason),
        formData.append("user_id", user?.user_id || "");
      const response = await apiCall(formData);
      if (response.result) {
        setShowReportUser(false);
      }
    } catch (error) {}
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
          source={{ uri: userInfo.images[currentImageIndex] }}
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
          {userInfo.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {userInfo.images.map((_: any, index: number) => (
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
        {userInfo.images.length > 1 && (
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
              {userInfo.name}
              {userInfo.age > 0 ? `, ${userInfo.age}` : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.distanceContainer}>
              <SimpleLineIcons
                name="location-pin"
                size={14}
                color={color.gray55}
              />
              <Text style={styles.distance}>{userInfo.distance}</Text>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Feather name="bookmark" size={20} color={color.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking for</Text>
          <View style={styles.lookingForContainer}>
            {userInfo.lookingFor.map((item: string, index: number) => (
              <View key={index} style={styles.lookingForTag}>
                <Text style={styles.lookingForText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {userInfo.interests.map((interest: string, index: number) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Languages */}
        {userInfo.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.interestsContainer}>
              {userInfo.languages.map((language: string, index: number) => (
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
            <Text style={styles.infoValue}>{userInfo.height}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nationality</Text>
            <Text style={styles.infoValue}>{userInfo.nationality}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Religion</Text>
            <Text style={styles.infoValue}>{userInfo.religion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Zodiac</Text>
            <Text style={styles.infoValue}>{userInfo.zodiac}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{userInfo.gender}</Text>
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
          name: userInfo.name,
          age: userInfo.age,
          image: userInfo.images[0],
        }}
        isMatch={false}
      />

      {/* Block Confirmation Modal */}
      <BlockConfirmation
        visible={showBlockConfirmation}
        onClose={() => setShowBlockConfirmation(false)}
        onBack={handleBackToProfileOptions}
        onConfirm={handleConfirmBlock}
        userName={userInfo.name}
      />

      {/* Report User Modal */}
      <ReportUser
        visible={showReportUser}
        onClose={() => setShowReportUser(false)}
        onBack={handleBackToProfileOptions}
        onSubmit={handleSubmitReport}
        userName={userInfo.name}
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
    alignContent: "center",
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
