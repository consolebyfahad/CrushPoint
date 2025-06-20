import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Profile({ navigation }: any) {
  const [userProfile, setUserProfile] = useState({
    name: "Julia",
    age: 24,
    mainPhoto:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop&crop=face",
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
    // Navigate to settings screen
  };

  const handleEditPrivateSpot = () => {
    console.log("Edit private spot");
    // Handle private spot editing
  };

  const handleEditPhotos = () => {
    console.log("Edit photos");
    // Navigate to photo editing screen
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
    router.push("/profile/basic_info");
  };

  const handleEditInterests = () => {
    console.log("Edit interests");
    // Navigate to interests editing screen
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCamera}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={24} color={color.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Photo */}
        <View style={styles.mainPhotoContainer}>
          <Image
            source={{ uri: userProfile.mainPhoto }}
            style={styles.mainPhoto}
          />
        </View>

        {/* Name and Age */}
        <View style={styles.nameSection}>
          <Text style={styles.userName}>
            {userProfile.name}, {userProfile.age}
          </Text>
          <TouchableOpacity onPress={handleEditPrivateSpot}>
            <Text style={styles.editPrivateSpot}>🔒 Edit private spot</Text>
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
              <Ionicons name="camera-outline" size={24} color={color.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tabButton}>
            <Ionicons name="home-outline" size={24} color={color.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton}>
            <Ionicons name="heart-outline" size={24} color={color.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton}>
            <Ionicons name="calendar-outline" size={24} color={color.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
            <View style={styles.activeTabBackground}>
              <Ionicons name="person" size={24} color={color.white} />
            </View>
          </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
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
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainPhoto: {
    width: SCREEN_WIDTH - 40,
    height: (SCREEN_WIDTH - 40) * 1.2,
    borderRadius: 20,
    resizeMode: "cover",
  },
  nameSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
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
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
  },
  editText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#5FB3D4",
  },
  photosContainer: {
    flexDirection: "row",
    gap: 12,
  },
  photoItem: {
    position: "relative",
  },
  photo: {
    width: 80,
    height: 100,
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
    width: 80,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 8,
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
  tabButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  activeTab: {
    position: "relative",
  },
  activeTabBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#5FB3D4",
    alignItems: "center",
    justifyContent: "center",
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
    color: color.gray400,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  relationshipGoals: {
    flexDirection: "row",
    alignItems: "center",
  },
  additionalGoals: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray400,
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
    height: 20,
  },
});
