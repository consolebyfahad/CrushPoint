import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { calculateDistance } from "@/utils/distanceCalculator";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "./custom_button";

interface UserCardProps {
  user: any;
  onViewProfile: (user: any) => void;
  onShowUserOnMap: (user: any) => void; // UPDATED: More descriptive prop name
}

export default function UserCard({
  user,
  onViewProfile,
  onShowUserOnMap, // UPDATED: Updated prop name
}: UserCardProps) {
  const { userData: currentUser } = useAppContext();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Calculate distance between current user and target user
  const distance = calculateDistance(
    {
      lat: currentUser?.lat || 0,
      lng: currentUser?.lng || 0,
    },
    {
      lat: user?.actualLocation?.lat || 0,
      lng: user?.actualLocation?.lng || 0,
    }
  );

  // Get profile image source - handle both URI and local assets
  const getProfileImageSource = () => {
    if (user?.images && user.images.length > 0 && user.images[0]) {
      return { uri: user.images[0] };
    }
    return undefined;
  };

  const profileImageSource = getProfileImageSource();

  // Handle view profile press
  const handleViewProfile = () => {
    try {
      onViewProfile(user);
    } catch (error) {
      console.error("Error in onViewProfile:", error);
      Alert.alert("Error", "Unable to view profile. Please try again.");
    }
  };

  // ENHANCED: Better location validation and error handling
  const hasValidLocation = () => {
    // Check if user has valid location in actualLocation
    const hasActualLocation =
      user?.actualLocation?.lat &&
      user?.actualLocation?.lng &&
      parseFloat(user.actualLocation.lat.toString()) !== 0 &&
      parseFloat(user.actualLocation.lng.toString()) !== 0 &&
      !isNaN(parseFloat(user.actualLocation.lat.toString())) &&
      !isNaN(parseFloat(user.actualLocation.lng.toString()));

    // Check if user has valid location in loc object
    const hasLocLocation =
      user?.loc?.lat &&
      user?.loc?.lng &&
      parseFloat(user.loc.lat.toString()) !== 0 &&
      parseFloat(user.loc.lng.toString()) !== 0 &&
      !isNaN(parseFloat(user.loc.lat.toString())) &&
      !isNaN(parseFloat(user.loc.lng.toString()));

    return hasActualLocation || hasLocLocation;
  };

  // UPDATED: Enhanced show on map function
  const handleShowOnMap = async () => {
    try {
      // Validate location before proceeding
      if (!hasValidLocation()) {
        Alert.alert(
          "Location Unavailable",
          "This user's location is not available on the map.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      setIsLoadingLocation(true);

      // Simulate a brief loading state for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Log the action for debugging
      console.log("Showing user on map:", {
        userId: user.id,
        name: user.name,
        actualLocation: user.actualLocation,
        loc: user.loc,
      });

      // Trigger the map navigation
      onShowUserOnMap(user);

      setIsLoadingLocation(false);
    } catch (error) {
      console.error("Error in handleShowOnMap:", error);
      setIsLoadingLocation(false);
      Alert.alert(
        "Error",
        "Unable to show location on map. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  // Format interests for display
  const formatInterests = (interests: string[] = []) => {
    return interests.slice(0, 3);
  };

  // Format looking for items
  const formatLookingFor = (lookingFor: string[] = []) => {
    return lookingFor.slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        {profileImageSource ? (
          <Image source={profileImageSource} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Feather name="user" size={50} color={color.gray55} />
          </View>
        )}

        {/* Online Status - Only show if user is online */}
        {user?.isOnline && (
          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}

        {/* Image overlay for viewing more photos */}
        {user?.images && user.images.length > 1 && (
          <View style={styles.imageOverlay}>
            <Text style={styles.imageCount}>
              +{user.images.length - 1} more
            </Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || "Unknown"}, {user?.age || "N/A"}
          </Text>
          <View style={styles.distanceContainer}>
            <SimpleLineIcons
              name="location-pin"
              size={16}
              color={color.gray55}
            />
            <Text style={styles.distance}>{distance}</Text>
          </View>
        </View>

        {/* Looking For Section */}
        {user?.lookingFor && user.lookingFor.length > 0 && (
          <View style={styles.lookingForSection}>
            <Text style={styles.sectionLabel}>Looking for:</Text>
            <View style={styles.lookingForContainer}>
              {formatLookingFor(user.lookingFor).map(
                (lookingFor: string, index: number) => (
                  <View
                    key={`looking-for-${index}-${lookingFor}`}
                    style={styles.lookingForTag}
                  >
                    <Text style={styles.lookingForText}>{lookingFor}</Text>
                  </View>
                )
              )}
              {user.lookingFor.length > 2 && (
                <View style={styles.moreTag}>
                  <Text style={styles.moreText}>
                    +{user.lookingFor.length - 2}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Interests Section */}
        {user?.interests && user.interests.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={styles.sectionLabel}>Interests:</Text>
            <View style={styles.interestsContainer}>
              {formatInterests(user.interests).map(
                (interest: string, index: number) => (
                  <View
                    key={`interest-${index}-${interest}`}
                    style={styles.interestTag}
                  >
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                )
              )}
              {user.interests.length > 3 && (
                <View style={styles.moreTag}>
                  <Text style={styles.moreText}>
                    +{user.interests.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Show message if no interests/looking for */}
        {(!user?.interests || user.interests.length === 0) &&
          (!user?.lookingFor || user.lookingFor.length === 0) && (
            <View style={styles.noInfoContainer}>
              <Text style={styles.noInfoText}>
                No interests or preferences shared yet
              </Text>
            </View>
          )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title="View Profile"
            style={styles.viewProfileButton}
            fontstyle={styles.viewProfileButtonText}
            onPress={handleViewProfile}
          />

          <TouchableOpacity
            style={[
              styles.mapButton,
              isLoadingLocation && styles.mapButtonLoading,
              !hasValidLocation() && styles.mapButtonDisabled, // NEW: Style for disabled state
            ]}
            onPress={handleShowOnMap}
            activeOpacity={0.8}
            disabled={isLoadingLocation || !hasValidLocation()} // NEW: Disable if no valid location
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={color.primary} />
            ) : (
              <SimpleLineIcons
                name="location-pin"
                size={20}
                color={hasValidLocation() ? color.primary : color.gray55} // NEW: Different color for disabled state
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: color.gray87,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 280,
    width: "100%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: color.gray94,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineStatus: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.white,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    fontFamily: font.medium,
    color: color.white,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCount: {
    fontSize: 12,
    fontFamily: font.medium,
    color: color.white,
  },
  userInfo: {
    padding: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
    marginRight: 8,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray95,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distance: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray55,
    marginLeft: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray14,
    marginBottom: 8,
  },
  lookingForSection: {
    marginBottom: 12,
  },
  lookingForContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lookingForTag: {
    backgroundColor: color.primary + "15", // 15% opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: color.primary + "30",
  },
  lookingForText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
    textTransform: "capitalize",
  },
  interestsSection: {
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: color.gray94,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  interestText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.black,
    textTransform: "capitalize",
  },
  moreTag: {
    backgroundColor: color.gray87,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    fontSize: 12,
    fontFamily: font.medium,
    color: color.gray14,
  },
  noInfoContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noInfoText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    fontStyle: "italic",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  viewProfileButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: color.primary,
  },
  viewProfileButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
  },
  mapButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.white,
    shadowColor: color.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonLoading: {
    borderColor: color.gray87,
  },
  // NEW: Style for disabled map button
  mapButtonDisabled: {
    borderColor: color.gray87,
    backgroundColor: color.gray95,
    opacity: 0.6,
  },
});
