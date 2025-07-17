import CustomButton from "@/components/custom_button";
import { useAppContext } from "@/context/app_context";
import useGetProfile from "@/hooks/useGetProfile";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router } from "expo-router";
import React from "react";
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Profile() {
  const { userData } = useAppContext();
  const { loading, error, refetch } = useGetProfile();
  const handleCamera = () => {
    console.log("Open camera");
    // Handle camera functionality
  };

  const handleSettings = () => {
    router.push("/profile/setting");
  };

  const handleEditPrivateSpot = () => {
    router.push({
      pathname: "/auth/private_spot",
      params: {
        fromEdit: "true",
      },
    });
  };

  const handleEditPhotos = () => {
    router.push({
      pathname: "/auth/add_photos",
      params: { fromEdit: "true" },
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{"Failed to load profile."}</Text>
        <CustomButton title="Retry" onPress={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.mainPhotoContainer}>
        <Image
          source={{ uri: userData.photos?.[0] ?? "" }}
          style={styles.mainPhoto}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCamera}
            activeOpacity={0.8}
          >
            <Feather name="camera" size={20} color={color.black} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSettings}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color={color.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[color.primary]}
          />
        }
      >
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
            <Text style={styles.editPrivateSpot}>Edit private spot</Text>
          </TouchableOpacity>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity onPress={handleEditPhotos}>
              <Text style={styles.editText}>Edit Photos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photosContainer}>
            {(userData.photos ?? []).length > 1 ? (
              (userData.photos ?? []).slice(0, 3).map((photo, index) => (
                <>
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                  </View>
                  <TouchableOpacity style={styles.addPhotoButton}>
                    <Feather name="camera" size={24} color={color.gray900} />
                  </TouchableOpacity>
                </>
              ))
            ) : (
              <TouchableOpacity style={styles.addPhotoButton}>
                <Feather name="camera" size={24} color={color.gray900} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Interested in</Text>
              <Text style={styles.infoValue}>{userData.gender_interest}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relationship goals</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>
                  {userData.parsedLookingFor?.[0] ?? ""}
                </Text>
                {(userData.parsedLookingFor?.length ?? 0) > 1 && (
                  <Text style={styles.additionalGoals}>
                    , +{userData.parsedLookingFor!.length - 1}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{userData.height}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nationality</Text>
              <Text style={styles.infoValue}>{userData.nationality}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Religion</Text>
              <Text style={styles.infoValue}>{userData.religion}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zodiac Sign</Text>
              <Text style={styles.infoValue}>{userData.zodiac}</Text>
            </View>
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity onPress={handleEditInterests}>
              <Text style={styles.editText}>Edit Interests</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.interestsContainer}>
            {(userData.parsedInterests ?? []).map((interest, index) => (
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
  retryButton: {
    backgroundColor: color.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: color.white,
    fontSize: 16,
    fontFamily: font.medium,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
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
  content: {
    flex: 1,
  },
  mainPhotoContainer: {
    height: SCREEN_HEIGHT * 0.55,
    position: "relative",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  editText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#5FB3D4",
  },
  photosContainer: {
    flexDirection: "row",
    // justifyContent: "space-between",
    gap: 12,
  },
  photoItem: {
    position: "relative",
  },
  photo: {
    width: 103,
    height: 103,
    borderRadius: 12,
    resizeMode: "cover",
  },
  removePhotoButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
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
  relationshipGoals: {
    flexDirection: "row",
    alignItems: "center",
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
  interestIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  interestText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
  },
  bottomSpacing: {
    height: 100,
  },
});
