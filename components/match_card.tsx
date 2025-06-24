import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "./custom_button";
export default function MatchCard({ match, onViewProfile, onOptions }: any) {
  const getMatchEmoji = (timeAgo: string) => {
    if (timeAgo.includes("hours")) {
      return svgIcon.Fire;
    } else if (timeAgo.includes("1 day")) {
      return svgIcon.Blink;
    } else {
      return svgIcon.Hi;
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
      <View style={styles.imageContainer}>
        <Image source={{ uri: match.image }} style={styles.profileImage} />
        {match.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.infoContainer}>
        {/* Match Info */}
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>
                {match.name}, {match.age}
              </Text>
              {match.isVerified && (
                <Feather
                  name="user"
                  size={16}
                  color={color.success}
                  style={styles.verifiedIcon}
                />
                // <Ionicons
                //   name="checkmark-circle"
                //   size={16}
                //   color="#10B981"
                //   style={styles.verifiedIcon}
                // />
              )}
            </View>

            <View style={styles.detailsRow}>
              <SimpleLineIcons
                name="location-pin"
                size={14}
                color={color.gray69}
              />

              <Text style={styles.distance}>{match.distance}</Text>
              <View style={styles.separator} />
              <Text style={styles.timeAgo}>{match.timeAgo}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={handleOptions}
            activeOpacity={0.8}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={color.gray55} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <CustomButton
            title="View Profile"
            style={{ width: "80%", paddingVertical: 8 }}
            fontstyle={{ fontSize: 14, fontFamily: font.medium }}
          />

          <View style={styles.emojiContainer}>
            <Text style={styles.matchEmoji}>
              {getMatchEmoji(match.timeAgo)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 99,
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
  infoContainer: {
    flex: 1,
    // flexDirection: "row",
  },
  matchInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  matchHeader: {
    // flexDirection: "row",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontFamily: font.medium,
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
    color: color.gray69,
    marginLeft: 4,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.gray69,
    marginHorizontal: 8,
  },
  timeAgo: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
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
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: color.gray94,
    alignItems: "center",
    justifyContent: "center",
  },
  matchEmoji: {
    opacity: 1,
    fontSize: 18,
  },
  optionsButton: {
    padding: 8,
  },
});
