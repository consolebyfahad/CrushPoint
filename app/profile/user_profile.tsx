import BlockConfirmation from "@/components/block_option";
import ProfileOptions from "@/components/profile_options";
import ReportUser from "@/components/report_user";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { calculateDistance } from "@/utils/distanceCalculator";
import {
  capitalizeFirstLetter,
  formatNationality,
  formatReligion,
  formatZodiac,
} from "@/utils/helper";
import { FloatingBubbleAnimation } from "@/utils/matchAnimation";
import { svgIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function UserProfile() {
  const { t } = useTranslation();
  const { user, userData: currentUser } = useAppContext();
  const params = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationProps, setAnimationProps] = useState<{
    svgEmoji?: any;
    color?: string;
  }>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Ref for PagerView
  const pagerRef = useRef<PagerView>(null);

  const userData = useMemo(() => {
    try {
      if (params.user && typeof params.user === "string") {
        const parsed = JSON.parse(params.user);
        return parsed;
      } else if (params.user && typeof params.user === "object") {
        return params.user;
      }
      return params;
    } catch (error) {
      return params;
    }
  }, [params, currentUser]);

  // Helper function to get user coordinates from multiple possible sources (same as user_card.tsx)
  const getUserCoordinates = (user: any) => {
    // Try actualLocation first (preferred)
    if (user?.actualLocation?.lat && user?.actualLocation?.lng) {
      const lat = parseFloat(user.actualLocation.lat.toString());
      const lng = parseFloat(user.actualLocation.lng.toString());

      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
    }

    // Fallback to loc object
    if (user?.loc?.lat && user?.loc?.lng) {
      const lat = parseFloat(user.loc.lat.toString());
      const lng = parseFloat(user.loc.lng.toString());

      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
    }

    // Fallback to direct lat/lng properties (for users without loc object)
    if (user?.lat && user?.lng) {
      const lat = parseFloat(user.lat.toString());
      const lng = parseFloat(user.lng.toString());

      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
    }

    return null;
  };

  // Get target user coordinates
  const targetUserCoords = getUserCoordinates(userData);

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
        height: "",
        nationality: [],
        religion: "",
        zodiac: "",
        about: "",
        images: [
          "https://via.placeholder.com/400x600/E5E5E5/999999?text=No+Photo",
        ],
      };
    }

    // Parse nationality from JSON string or array
    const parseNationality = (nationalityData: any) => {
      if (!nationalityData) return [];
      if (Array.isArray(nationalityData)) return nationalityData;
      if (typeof nationalityData === "string") {
        try {
          // Handle escaped JSON strings like "[\\\"Not Specified\\\",\\\"American\\\"]"
          const cleaned = nationalityData.replace(/\\"/g, '"');
          const parsed = JSON.parse(cleaned);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          // If parsing fails, treat as single string
          return [nationalityData];
        }
      }
      return [nationalityData];
    };

    // Calculate real distance between current user and profile user
    const realDistance = targetUserCoords
      ? calculateDistance(
          {
            lat: parseFloat(currentUser?.lat?.toString() || "0"),
            lng: parseFloat(currentUser?.lng?.toString() || "0"),
          },
          targetUserCoords
        )
      : "N/A";

    return {
      id: userData.id || "unknown",
      name: userData.name || "Unknown User",
      age: userData.age || 0,
      distance: realDistance,
      isOnline: userData.isOnline || true,
      lookingFor: userData.lookingFor || [],
      interests: userData.interests || [],
      height: userData.height || "",
      nationality: parseNationality(userData.nationality),
      religion: userData.religion || "",
      zodiac: userData.zodiac || "",
      about: userData.about || "This is me",
      email: userData.email || "",
      gender: userData.gender === "female" ? "Female" : userData.gender || "",
      country: userData.country || "",
      state: userData.state || "",
      city: userData.city || "",
      languages: Array.isArray(userData.languages)
        ? userData.languages
        : userData.languages
        ? userData.languages.split(",").map((lang: any) => lang.trim())
        : [],
      images:
        userData.images && userData.images.length > 0
          ? userData.images
          : ["https://via.placeholder.com/400x600/E5E5E5/999999?text=No+Photo"],
    };
  }, [userData, currentUser]);

  const handleBack = () => {
    router.back();
  };

  const handleOptions = () => {
    setShowProfileOptions(true);
  };

  // Handle page change from PagerView
  const handlePageSelected = (event: any) => {
    setCurrentImageIndex(event.nativeEvent.position);
  };

  // Navigate to previous image programmatically
  const handlePreviousImage = () => {
    const prevIndex =
      currentImageIndex === 0
        ? userInfo.images.length - 1
        : currentImageIndex - 1;
    pagerRef.current?.setPage(prevIndex);
  };

  // Navigate to next image programmatically
  const handleNextImage = () => {
    const nextIndex =
      currentImageIndex === userInfo.images.length - 1
        ? 0
        : currentImageIndex + 1;
    pagerRef.current?.setPage(nextIndex);
  };

  const actionEmojis = [
    { emoji: svgIcon.Like, action: "like", color: "#3B82F6" },
    { emoji: svgIcon.Fire, action: "super_like", color: "#F59E0B" },
    { emoji: svgIcon.Blink, action: "smile", color: "#10B981" },
    { emoji: svgIcon.Tea, action: "message", color: "#8B5CF6" },
    { emoji: svgIcon.Hi, action: "friend", color: "#F97316" },
  ];

  const handleEmojiAction = async (action: any) => {
    if (isAnimating) return;
    setIsAnimating(true);

    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "matches");
      formData.append("match_id", userInfo.id);
      formData.append("user_id", user?.user_id || "");
      formData.append("emoji", action);

      const response = await apiCall(formData);

      if (response.result) {
        // Find the corresponding emoji and color for animation
        const emojiData = actionEmojis.find((item) => item.action === action);

        setAnimationProps({
          svgEmoji: emojiData?.emoji || svgIcon.Like,
          color: emojiData?.color || "#3B82F6",
        });
        setShowAnimation(true);
      }
    } catch (error) {
      // Animation error handled silently
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setIsAnimating(false);
    setAnimationProps({});
  };

  const renderEmojiButton = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      key={index}
      style={[styles.emojiButton, isAnimating && styles.emojiButtonDisabled]}
      onPress={() => handleEmojiAction(item.action)}
      activeOpacity={isAnimating ? 1 : 0.8}
      disabled={isAnimating}
    >
      <Text style={[styles.emojiText, isAnimating && styles.emojiTextDisabled]}>
        {item.emoji}
      </Text>
      {isAnimating && <View style={styles.loadingOverlay}>{item.emoji}</View>}
    </TouchableOpacity>
  );

  const handleBlock = () => {
    setShowProfileOptions(false);
    setShowBlockConfirmation(true);
  };

  const handleConfirmBlock = async () => {
    // Handle block logic here
    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "blocked_users");
      formData.append("block_id", userInfo.id);
      formData.append("user_id", user?.user_id || "");
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
    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "reported_users");
      formData.append("block_id", userInfo.id);
      formData.append("additional_details", reportData.additionalDetails);
      formData.append("reason", reportData.reason);
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

  // Location validation function (same as user card)
  const hasValidLocation = () => {
    return targetUserCoords !== null;
  };

  // Handle show user location on map (same logic as user card)
  const handleShowOnMap = async () => {
    try {
      setIsLoadingLocation(true);

      // Validate location before proceeding
      if (!hasValidLocation()) {
        Alert.alert(
          "Location Unavailable",
          "This user's location is not available on the map.",
          [{ text: "OK", style: "default" }]
        );
        setIsLoadingLocation(false);
        return;
      }

      // Simulate a brief loading state for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate to home tab with map view and user data (same as list view)
      router.push({
        pathname: "/(tabs)",
        params: {
          viewType: "Map",
          selectedUserId: userInfo.id,
          selectedUserName: userInfo.name,
          selectedUserLocation: JSON.stringify({
            actualLocation: userData.actualLocation,
            loc: userData.loc,
            lat: userData.lat,
            lng: userData.lng,
          }),
        },
      });

      setIsLoadingLocation(false);
    } catch (error) {
      setIsLoadingLocation(false);
      Alert.alert(
        "Error",
        "Unable to show location on map. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <View style={styles.imageContainer}>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={handlePageSelected}
          >
            {userInfo.images.map((imageUri: any, index: any) => (
              <View key={index} style={styles.page}>
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              </View>
            ))}
          </PagerView>

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
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={color.white}
              />
            </TouchableOpacity>
          </View>

          {/* Image Navigation Areas (Optional - for manual navigation) */}
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
            {actionEmojis.map((item, index) =>
              renderEmojiButton({ item, index })
            )}
          </View>

          {/* Center Emoji Animation */}
          {showAnimation && (
            <FloatingBubbleAnimation
              visible={showAnimation}
              svgEmoji={animationProps.svgEmoji}
              color={animationProps.color}
              onComplete={handleAnimationComplete}
            />
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
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
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  isLoadingLocation && styles.locationButtonLoading,
                  !hasValidLocation() && styles.locationButtonDisabled,
                ]}
                onPress={handleShowOnMap}
                activeOpacity={0.8}
                disabled={isLoadingLocation || !hasValidLocation()}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color={color.primary} />
                ) : (
                  <SimpleLineIcons
                    name="location-pin"
                    size={20}
                    color={hasValidLocation() ? color.primary : color.gray55}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Looking For */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking for</Text>
            <View style={styles.lookingForContainer}>
              {userInfo.lookingFor.map((item: any, index: number) => (
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
              {userInfo.interests.map((item: any, index: number) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Languages */}
          {userInfo.languages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.interestsContainer}>
                {userInfo.languages.map((item: any, index: number) => (
                  <View key={index} style={styles.languageTag}>
                    <Text style={styles.languageText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Other Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            {/* Height - only show if specified */}
            {userInfo.height && userInfo.height.trim() !== "" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>
                  {capitalizeFirstLetter(userInfo.height)}
                </Text>
              </View>
            )}

            {/* Nationality - only show if specified */}
            {userInfo.nationality && userInfo.nationality.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nationality</Text>
                <View style={styles.nationalityContainer}>
                  {userInfo.nationality.map(
                    (nationality: string, index: number) => (
                      <View key={index} style={styles.nationalityTag}>
                        <Text style={styles.nationalityText}>
                          {formatNationality(nationality)}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}

            {/* Religion - only show if specified */}
            {userInfo.religion && userInfo.religion.trim() !== "" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Religion</Text>
                <Text style={styles.infoValue}>
                  {formatReligion(userInfo.religion)}
                </Text>
              </View>
            )}

            {/* Zodiac - only show if specified */}
            {userInfo.zodiac && userInfo.zodiac.trim() !== "" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Zodiac</Text>
                <Text style={styles.infoValue}>
                  {formatZodiac(userInfo.zodiac)}
                </Text>
              </View>
            )}

            {/* Gender - only show if specified */}
            {userInfo.gender && userInfo.gender.trim() !== "" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {capitalizeFirstLetter(userInfo.gender)}
                </Text>
              </View>
            )}
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
  pagerView: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  page: {
    flex: 1,
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
    alignItems: "center",
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
    zIndex: 5,
  },
  rightImageArea: {
    position: "absolute",
    right: 0,
    top: 0,
    width: SCREEN_WIDTH / 2,
    height: "100%",
    zIndex: 5,
  },
  imageIndicators: {
    flexDirection: "row",
    gap: 6,
    zIndex: 5,
  },
  indicator: {
    width: 30,
    height: 4,
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
  emojiButtonDisabled: {
    opacity: 0.6,
  },
  emojiTextDisabled: {
    opacity: 0.5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  // Profile Info Styles
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
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.white,
  },
  locationButtonLoading: {
    backgroundColor: "#F8F8F8",
  },
  locationButtonDisabled: {
    backgroundColor: "#F8F8F8",
    borderColor: "#F0F0F0",
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
  nationalityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  nationalityTag: {
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#5FB3D4",
  },
  nationalityText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#5FB3D4",
  },
});
