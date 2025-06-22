import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "./custom_button";
export default function UserCard({ user, onViewProfile, onBookmark }: any) {
  const defaultUser = {
    id: "1",
    name: "Alex",
    age: 25,
    distance: "0.5 km",
    isOnline: true,
    lookingFor: "Serious relationship",
    interests: ["Coffee", "Hiking", "Photography"],
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    ...user,
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(defaultUser);
    } else {
      console.log("View profile for:", defaultUser.name);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(defaultUser);
    } else {
      console.log("Bookmark user:", defaultUser.name);
    }
  };

  const getInterestIcon = (interest: string) => {
    switch (interest.toLowerCase()) {
      case "coffee":
        return "☕";
      case "hiking":
        return "🥾";
      case "photography":
        return "📸";
      case "music":
        return "🎵";
      case "travel":
        return "✈️";
      case "fitness":
        return "💪";
      case "cooking":
        return "👨‍🍳";
      case "reading":
        return "📚";
      default:
        return "🎯";
    }
  };

  const getLookingForIcon = (lookingFor: string) => {
    if (lookingFor.toLowerCase().includes("serious")) {
      return "🩵";
    } else if (lookingFor.toLowerCase().includes("casual")) {
      return "😊";
    } else if (lookingFor.toLowerCase().includes("friendship")) {
      return "🤝";
    } else {
      return "🔥";
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: defaultUser.image }}
          style={styles.profileImage}
        />

        {/* Online Status */}
        {defaultUser.isOnline && (
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
            {defaultUser.name}, {defaultUser.age}
          </Text>
          <View style={styles.distanceContainer}>
            <SimpleLineIcons
              name="location-pin"
              size={16}
              color={color.gray300}
            />
            <Text style={styles.distance}>{defaultUser.distance}</Text>
          </View>
        </View>

        {/* Looking For */}
        <View style={styles.lookingForContainer}>
          <Text style={styles.lookingForIcon}>
            {getLookingForIcon(defaultUser.lookingFor)}
          </Text>
          <Text style={styles.lookingForText}>{defaultUser.lookingFor}</Text>
        </View>

        {/* Interests */}
        <View style={styles.interestsContainer}>
          {defaultUser.interests
            .slice(0, 3)
            .map((interest: string, index: number) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestIcon}>
                  {getInterestIcon(interest)}
                </Text>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={handleViewProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity> */}
          <CustomButton
            title="View Profile"
            style={{ width: "80%", paddingVertical: 8 }}
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
    borderColor: color.gray1000,
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
    color: color.gray300,
    marginLeft: 4,
  },
  lookingForContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginBottom: 16,
    backgroundColor: color.white200,
    padding: 12,
    borderRadius: 99,
  },
  lookingForIcon: {
    fontSize: 16,
    marginRight: 8,
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
    backgroundColor: color.gray500,
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
    borderColor: color.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
});
