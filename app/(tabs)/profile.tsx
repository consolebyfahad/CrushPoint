import CustomButton from "@/components/custom_button";
import { useAppContext } from "@/context/app_context";
import useGetProfile from "@/hooks/useGetProfile";
import { color, font } from "@/utils/constants";
import {
  formatGenderInterest,
  formatLookingFor,
  formatNationality,
  formatReligion,
  formatZodiac,
} from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProfileTab() {
  const { t } = useTranslation();
  const { userData, user } = useAppContext();
  console.log("userData", JSON.stringify(userData));
  const { loading, error, refetch } = useGetProfile();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const photos = userData.photos || [];
  const hasMultiplePhotos = photos.length > 1;
  // NEW: Auto refresh when screen comes into focus (returning from edit screens)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      // Only refresh if we have user data and we're not currently loading
      if (user?.user_id && !loading && isActive) {
        setIsRefreshing(true);

        // Small delay to ensure smooth navigation
        setTimeout(() => {
          if (isActive) {
            refetch().finally(() => {
              if (isActive) {
                setIsRefreshing(false);
              }
            });
          }
        }, 200);
      }

      return () => {
        isActive = false;
      };
    }, [user?.user_id]) // FIXED: Only depend on user_id, not refetch or loading
  );

  const handleSettings = () => {
    router.push("/profile/setting");
  };

  const handleEditPrivateSpot = () => {
    router.push({
      pathname: "/profile/private_spots",
      params: {
        fromEdit: "true",
      },
    });
  };

  const handleEditPhotos = () => {
    router.push({
      pathname: "/auth/add_photos",
      params: { fromEdit: "true", photos: photos },
    });
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/profile/basic_info",
      params: {
        fromEdit: "true",
      },
    });
  };

  const handleEditInterests = () => {
    router.push({
      pathname: "/auth/interests",
      params: {
        isEdit: "true",
      },
    });
  };

  // Handle page change from PagerView
  const handlePageSelected = (event: any) => {
    setCurrentImageIndex(event.nativeEvent.position);
  };

  // Navigate to previous image programmatically
  const handlePreviousImage = () => {
    const prevIndex =
      currentImageIndex === 0 ? photos.length - 1 : currentImageIndex - 1;
    pagerRef.current?.setPage(prevIndex);
  };

  // Navigate to next image programmatically
  const handleNextImage = () => {
    const nextIndex =
      currentImageIndex === photos.length - 1 ? 0 : currentImageIndex + 1;
    pagerRef.current?.setPage(nextIndex);
  };

  // ENHANCED: Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    if (loading) return;

    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error during manual refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, loading]);

  // Loading state
  if (loading && !userData?.name) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>{t("errors.loadingProfile")}</Text>
      </View>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("matches.failedToLoadProfile")}</Text>
        <CustomButton title={t("common.retry")} onPress={refetch} />
      </View>
    );
  }

  <CustomButton
    title="Logout"
    onPress={() => {
      router.push("/auth/login");
    }}
  />;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleManualRefresh}
            colors={[color.primary]}
            tintColor={color.primary}
            title={t("common.pullToRefresh")}
            titleColor={color.gray55}
          />
        }
      >
        {/* Header with Swipeable Image */}
        <View style={styles.mainPhotoContainer}>
          {hasMultiplePhotos ? (
            <PagerView
              ref={pagerRef}
              style={styles.pagerView}
              initialPage={0}
              onPageSelected={handlePageSelected}
            >
              {photos.map((photo, index) => (
                <View key={index} style={styles.page}>
                  <Image
                    source={{ uri: photo }}
                    style={styles.mainPhoto}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </PagerView>
          ) : (
            <Image
              source={{ uri: photos[0] || "" }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
          )}

          {/* Header Overlay */}
          <View style={styles.header}>
            <View style={{ width: 44, height: 44 }} />

            {/* Custom Image Indicators */}
            {hasMultiplePhotos && (
              <View style={styles.imageIndicators}>
                {photos.map((_, index) => (
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

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSettings}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color={color.black} />
            </TouchableOpacity>
          </View>

          {/* Image Navigation Areas (like UserProfile) */}
          {hasMultiplePhotos && (
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
        </View>

        {/* Name and Age */}
        <View style={styles.nameSection}>
          <Text style={styles.userName}>
            {userData.name}, {userData.age}
          </Text>
          <TouchableOpacity
            onPress={handleEditPrivateSpot}
            style={styles.location}
          >
            <SimpleLineIcons
              name="location-pin"
              size={14}
              color={color.primary}
            />
            <Text style={styles.editPrivateSpot}>
              {t("profile.editPrivateSpot")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("profile.photos")}</Text>
            <TouchableOpacity onPress={handleEditPhotos}>
              <Text style={styles.editText}>{t("profile.editPhotos")}</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.photosContainer,
              photos.length === 3 && {
                justifyContent: "space-between",
              },
            ]}
          >
            {photos.slice(0, 3).map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoItem}
                onPress={() => {
                  setCurrentImageIndex(index);
                  pagerRef.current?.setPage(index);
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: photo }} style={styles.photo} />
                {index === currentImageIndex && (
                  <View style={styles.currentPhotoIndicator}>
                    <View style={styles.currentPhotoDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {photos.length < 3 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleEditPhotos}
              >
                <Feather name="camera" size={24} color={color.gray900} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* About/Bio Section */}
        {userData.about && userData.about.trim() !== "" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("profile.about")}</Text>
              <TouchableOpacity onPress={handleEditProfile}>
                <Text style={styles.editText}>{t("profile.editProfile")}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.bioText}>{userData.about}</Text>
          </View>
        )}

        {/* Basic Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("profile.basicInfo")}</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Text style={styles.editText}>{t("profile.editProfile")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("profile.interestedIn")}</Text>
              <Text style={styles.infoValue}>
                {formatGenderInterest(userData.gender_interest, t)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t("profile.relationshipGoals")}
              </Text>
              <View style={styles.infoRow}>
                {userData.originalLookingForIds && userData.originalLookingForIds.length > 0 ? (
                  <>
                    <Text style={styles.infoValue}>
                      {formatLookingFor(userData.originalLookingForIds[0], t)}
                    </Text>
                    {userData.originalLookingForIds.length > 1 && (
                      <Text style={styles.additionalGoals}>
                        , +{userData.originalLookingForIds.length - 1}
                      </Text>
                    )}
                  </>
                ) : userData.parsedLookingFor && userData.parsedLookingFor.length > 0 ? (
                  <>
                    {/* Fallback: format the first parsed item if it's a raw ID */}
                    <Text style={styles.infoValue}>
                      {formatLookingFor(userData.parsedLookingFor[0], t)}
                    </Text>
                    {userData.parsedLookingFor.length > 1 && (
                      <Text style={styles.additionalGoals}>
                        , +{userData.parsedLookingFor.length - 1}
                      </Text>
                    )}
                  </>
                ) : null}
              </View>
            </View>

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{userData.height}</Text>
            </View> */}

            {/* Nationality - only show if specified */}
            {userData.originalNationalityValues &&
              userData.originalNationalityValues.length > 0 &&
              userData.originalNationalityValues[0] &&
              userData.originalNationalityValues[0].trim() !== "" && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {t("profile.nationality")}
                  </Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoValue}>
                      {formatNationality(userData.originalNationalityValues[0], t)}
                    </Text>
                    {userData.originalNationalityValues.length > 1 && (
                      <Text style={styles.additionalGoals}>
                        , +{userData.originalNationalityValues.length - 1}
                      </Text>
                    )}
                  </View>
                </View>
              )}

            {/* Religion - only show if specified */}
            {userData.religion && userData.religion.trim() !== "" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("profile.religion")}</Text>
                <Text style={styles.infoValue}>
                  {formatReligion(userData.religion, t)}
                </Text>
              </View>
            )}

            {/* Zodiac - only show if specified */}
            {userData.zodiac && userData.zodiac.trim() !== "" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("profile.zodiac")}</Text>
                <Text style={styles.infoValue}>
                  {formatZodiac(userData.zodiac, t)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("profile.interests")}</Text>
            <TouchableOpacity onPress={handleEditInterests}>
              <Text style={styles.editText}>{t("profile.editInterests")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.interestsContainer}>
            {((userData.parsedInterests && userData.parsedInterests.length > 0) ? userData.parsedInterests : []).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.white,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.error,
    textAlign: "center",
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  mainPhotoContainer: {
    height: SCREEN_HEIGHT * 0.55,
    position: "relative",
  },
  pagerView: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
  },
  header: {
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageIndicators: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
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
  nameSection: {
    padding: 16,
    backgroundColor: color.white,
    marginBottom: 16,
  },
  userName: {
    fontSize: 28,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  editPrivateSpot: {
    fontSize: 14,
    fontFamily: font.regular,
    color: "#5FB3D4",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  section: {
    backgroundColor: color.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  bioText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    lineHeight: 24,
  },
  editText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#5FB3D4",
  },
  photosContainer: {
    // flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  photoItem: {
    position: "relative",
  },
  photo: {
    width: 100,
    height: 108,
    borderRadius: 12,
    resizeMode: "cover",
  },
  currentPhotoIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentPhotoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.white,
  },
  addPhotoButton: {
    width: 103,
    height: 103,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.gray94,
  },
  infoContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    textTransform: "capitalize",
  },
  additionalGoals: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray14,
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
  interestText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
  },
  bottomSpacing: {
    height: 110,
  },
  // NEW: Refresh overlay styles
  refreshOverlay: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray55,
  },
});
