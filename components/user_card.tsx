import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { calculateDistance } from "@/utils/distanceCalculator";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "./custom_button";

interface UserCardProps {
  user: any;
  onViewProfile: (user: any) => void;
  onBookmark: (user: any) => void;
}

export default function UserCard({
  user,
  onViewProfile,
  onBookmark,
}: UserCardProps) {
  const { userData: currentUser } = useAppContext();

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
    // Return undefined if no valid image, will trigger fallback
    return undefined;
  };

  const profileImageSource = getProfileImageSource();

  // Handle view profile press
  const handleViewProfile = () => {
    try {
      onViewProfile(user);
    } catch (error) {
      console.error("Error in onViewProfile:", error);
    }
  };

  // Handle bookmark press
  const handleBookmark = () => {
    try {
      onBookmark(user);
    } catch (error) {
      console.error("Error in onBookmark:", error);
    }
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
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>
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

        {/* Looking For - Fixed key prop issue */}
        {user?.lookingFor && user.lookingFor.length > 0 && (
          <View style={styles.interestsContainer}>
            {user.lookingFor
              .slice(0, 2)
              .map((lookingFor: string, index: number) => (
                <View
                  key={`looking-for-${index}-${lookingFor}`}
                  style={styles.lookingForContainer}
                >
                  <Text style={styles.lookingForText}>{lookingFor}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Interests - Fixed key prop issue */}
        {user?.interests && user.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            {user.interests
              .slice(0, 3)
              .map((interest: string, index: number) => (
                <View
                  key={`interest-${index}-${interest}`}
                  style={styles.interestTag}
                >
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
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
            onPress={handleViewProfile}
          />

          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleBookmark}
            activeOpacity={0.8}
          >
            <Feather name="map" size={18} color="black" />
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
    borderColor: color.gray870,
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
    height: 300,
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
    backgroundColor: "#5FB3D4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  userInfo: {
    padding: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginLeft: 4,
  },
  lookingForContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: color.gray95,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  lookingForText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
    textTransform: "capitalize",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray94,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.black,
    textTransform: "capitalize",
  },
  noInfoContainer: {
    paddingVertical: 12,
    marginBottom: 8,
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
    marginTop: 8,
  },
  viewProfileButton: {
    flex: 1,
    paddingVertical: 12,
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.white,
  },
});
