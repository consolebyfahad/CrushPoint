import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MatchCard({ match, onViewProfile, onOptions }: any) {
  const getMatchEmoji = (timeAgo: string) => {
    if (timeAgo.includes("hours")) {
      return "🔥"; // Fire for recent matches
    } else if (timeAgo.includes("1 day")) {
      return "😊"; // Smile for day-old matches
    } else {
      return "🤝"; // Handshake for older matches
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(match);
    } else {
      console.log("View profile for:", match.name);
    }
  };

  const handleOptions = () => {
    if (onOptions) {
      onOptions(match);
    } else {
      console.log("Options for:", match.name);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: match.image }} style={styles.profileImage} />
        {match.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>
            {match.name}, {match.age}
          </Text>
          {match.isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#10B981"
              style={styles.verifiedIcon}
            />
          )}
        </View>

        <View style={styles.detailsRow}>
          <Ionicons name="location-outline" size={14} color={color.gray400} />
          <Text style={styles.distance}>{match.distance}</Text>
          <View style={styles.separator} />
          <Text style={styles.timeAgo}>{match.timeAgo}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={handleViewProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <View style={styles.emojiContainer}>
            <Text style={styles.matchEmoji}>
              {getMatchEmoji(match.timeAgo)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={handleOptions}
            activeOpacity={0.8}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={16}
              color={color.gray400}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  imageContainer: {
    position: "relative",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: "cover",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: color.white,
  },
  matchInfo: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray400,
    marginLeft: 4,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.gray400,
    marginHorizontal: 8,
  },
  timeAgo: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray400,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewProfileButton: {
    flex: 1,
    backgroundColor: "#5FB3D4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
  },
  viewProfileText: {
    fontSize: 14,
    fontFamily: font.semiBold,
    color: color.white,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  matchEmoji: {
    fontSize: 18,
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
});
