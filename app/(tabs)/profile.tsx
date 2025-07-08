import { color, font } from "@/utils/constants";
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Profile({ navigation }: any) {
  const [userProfile, setUserProfile] = useState({
    name: "Julia",
    age: 24,
    mainPhoto:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face",
    photos: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face",
    ],
    basicInfo: {
      interestedIn: "Men",
      relationshipGoals: ["Serious Relationship", "Long-term", "Marriage"],
      height: "120 cm",
      nationality: "USA",
      religion: "Christianity",
      zodiacSign: "Cancer",
    },
    interests: ["Travel", "Art", "Cooking", "Fashion", "Music", "Wine"],
  });

  const handleCamera = () => {
    console.log("Open camera");
    // Handle camera functionality
  };

  const handleSettings = () => {
    console.log("Open settings");
    router.push("/profile/setting");
  };

  const handleEditPrivateSpot = () => {
    console.log("Edit private spot");
    router.push({
      pathname: "/auth/private_spot",
      params: { fromEdit: "true" },
    });
  };

  const handleEditPhotos = () => {
    console.log("Edit photos");
    router.push({
      pathname: "/auth/add_photos",
      params: { fromEdit: "true" },
    });
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
    router.push("/profile/basic_info");
  };

  const handleEditInterests = () => {
    console.log("Edit interests");
    router.push({
      pathname: "/auth/interests",
      params: { fromEdit: "true" },
    });
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.mainPhotoContainer}>
        <Image
          source={{ uri: userProfile.mainPhoto }}
          style={styles.mainPhoto}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCamera}
            activeOpacity={0.8}
          >
            {/* <Ionicons name="camera-outline" size={24} color={color.black} /> */}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Photo */}

        {/* Name and Age */}
        <View style={styles.nameSection}>
          <Text style={styles.userName}>
            {userProfile.name}, {userProfile.age}
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
            {userProfile.photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity style={styles.removePhotoButton}>
                  <Ionicons name="close" size={16} color={color.white} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Photo Button */}
            <TouchableOpacity style={styles.addPhotoButton}>
              <Feather name="camera" size={24} color={color.gray900} />
            </TouchableOpacity>
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
              <Text style={styles.infoValue}>
                {userProfile.basicInfo.interestedIn}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relationship goals</Text>
              <View style={styles.relationshipGoals}>
                <Text style={styles.infoValue}>
                  {userProfile.basicInfo.relationshipGoals[0]}
                </Text>
                {userProfile.basicInfo.relationshipGoals.length > 1 && (
                  <Text style={styles.additionalGoals}>
                    , +{userProfile.basicInfo.relationshipGoals.length - 1}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {userProfile.basicInfo.height}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nationality</Text>
              <Text style={styles.infoValue}>
                {userProfile.basicInfo.nationality}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Religion</Text>
              <Text style={styles.infoValue}>
                {userProfile.basicInfo.religion}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zodiac Sign</Text>
              <Text style={styles.infoValue}>
                {userProfile.basicInfo.zodiacSign}
              </Text>
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
            {userProfile.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestIcon}>
                  {getInterestIcon(interest)}
                </Text>
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
    // backgroundColor: color.white,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    justifyContent: "space-between",
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
    // borderWidth: 2,
    // borderColor: "#E5E5E5",
    // borderStyle: "dashed",
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
