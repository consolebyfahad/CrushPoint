import { color, font } from "@/utils/constants";
import { svgIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "./custom_button";

interface MatchCardProps {
  match: any;
  onViewProfile: (match: any) => void;
  onOptions: (match: any) => void;
}

export default function MatchCard({
  match,
  onViewProfile,
  onOptions,
}: MatchCardProps) {
  // Map emoji actions to SVG icons and get the appropriate emoji
  const getMatchEmoji = (emoji: string) => {
    const emojiMap: { [key: string]: string } = {
      like: svgIcon.Like,
      super_like: svgIcon.Fire,
      smile: svgIcon.Blink,
      message: svgIcon.Tea,
      friend: svgIcon.Hi,
    };

    return emojiMap[emoji] || svgIcon.Hi;
  };

  // Get emoji color based on type
  const getEmojiColor = (emoji: string) => {
    const colorMap: { [key: string]: string } = {
      like: "#3B82F6",
      super_like: "#F59E0B",
      smile: "#10B981",
      message: "#8B5CF6",
      friend: "#F97316",
    };

    return colorMap[emoji] || "#F97316"; // Default color
  };

  const handleViewProfile = () => {
    if (onViewProfile && match) {
      onViewProfile(match);
    } else {
      console.log("View profile for:", match?.name || "Unknown user");
    }
  };

  const handleOptions = () => {
    if (onOptions && match) {
      onOptions(match);
    } else {
      console.log("Options for:", match?.name || "Unknown user");
    }
  };

  // Handle missing image
  const getImageSource = () => {
    if (match?.image) {
      return { uri: match.image };
    } else if (match?.images && match.images.length > 0) {
      return { uri: match.images[0] };
    }
    // Return undefined to show placeholder
    return undefined;
  };

  const imageSource = getImageSource();
  console.log("match", match);
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Feather name="user" size={24} color={color.gray55} />
          </View>
        )}
        {match?.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.infoContainer}>
        {/* Match Info */}
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {match?.name || "Unknown"}, {match?.age || "N/A"}
              </Text>
              {match?.isVerified && (
                <Feather
                  name="check-circle"
                  size={16}
                  color={color.success}
                  style={styles.verifiedIcon}
                />
              )}
            </View>

            <View style={styles.detailsRow}>
              <SimpleLineIcons
                name="location-pin"
                size={14}
                color={color.gray69}
              />
              <Text style={styles.distance}>{match?.distance || "2.5 km"}</Text>
              <View style={styles.separator} />
              <Text style={styles.timeAgo}>{match?.timeAgo || "Recently"}</Text>
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
            style={styles.viewProfileButton}
            fontstyle={styles.viewProfileButtonText}
            onPress={handleViewProfile}
          />

          <View
            style={[
              styles.emojiContainer,
              { backgroundColor: `${getEmojiColor(match?.emoji)}20` },
            ]}
          >
            <Text
              style={[
                styles.matchEmoji,
                { color: getEmojiColor(match?.emoji) },
              ]}
            >
              {getMatchEmoji(match?.emoji)}
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
    borderRadius: 35,
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: color.gray94,
    alignItems: "center",
    justifyContent: "center",
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
    gap: 8,
  },
  matchInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  matchHeader: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 4,
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
  optionsButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewProfileButton: {
    flex: 1,
    paddingVertical: 8,
    marginRight: 12,
  },
  viewProfileButtonText: {
    fontSize: 14,
    fontFamily: font.medium,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  matchEmoji: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
