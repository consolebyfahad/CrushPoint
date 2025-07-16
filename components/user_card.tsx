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
  onViewProfile: () => void;
  onBookmark: () => void;
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
    // If user has images, use the first one as URI
    if (user?.images && user.images.length > 0 && user.images[0]) {
      return { uri: user.images[0] };
    }
  };

  const profileImageSource = getProfileImageSource();

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image source={profileImageSource} style={styles.profileImage} />

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

        {/* Looking For */}

        <View style={styles.interestsContainer}>
          {user?.lookingFor
            ?.slice(0, 3)
            .map((lookingFor: string, index: number) => (
              <View style={styles.lookingForContainer}>
                <Text style={styles.lookingForText}>{lookingFor}</Text>
              </View>
            ))}
        </View>

        {/* Interests */}
        <View style={styles.interestsContainer}>
          {user?.interests
            ?.slice(0, 3)
            .map((interest: string, index: number) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title="View Profile"
            style={{ width: "80%", paddingVertical: 8 }}
            onPress={() => onViewProfile(user)}
          />

          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={onBookmark}
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
    padding: 12,
    borderRadius: 99,
  },
  lookingForText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.primary,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray94,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.black,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  bookmarkButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
    alignItems: "center",
    justifyContent: "center",
  },
});
