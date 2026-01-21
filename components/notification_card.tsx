import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationCard({
  notification,
  onPress,
  onDelete,
}: any) {
  const getNotificationIcon = (type: string) => {
    const normalizedType = type?.toLowerCase() || "";
    
    switch (normalizedType) {
      case "reaction":
      case "new_reaction":
        return {
          library: "SimpleLineIcons",
          name: "emotsmile",
          color: "#49adbe",
          backgroundColor: "#dbeff2",
        };
      case "match":
      case "new_match":
        return {
          library: "SimpleLineIcons",
          name: "heart",
          color: "#e04134",
          backgroundColor: "#f9d9d6",
        };
      case "profile_view":
      case "profile_viewed":
      case "profile_like":
      case "like":
        return {
          library: "SimpleLineIcons",
          
          name: "like",
          color: "#A78BFA",
          backgroundColor: "#F3F4F9",
        };
      case "event":
      case "event_reminder":
        return {
          library: "SimpleLineIcons",
          name: "calendar",
          color: "#40AF53",
          backgroundColor: "#d9efdd",
        };
      case "message":
      case "new_message":
        return {
          library: "Feather",
          name: "message-circle",
          color: "#3B82F6",
          backgroundColor: "#DBEAFE",
        };
      default:
        return {
          library: "SimpleLineIcons",
          name: "bell",
          color: "#40AF53",
          backgroundColor: "#F9FAFB",
        };
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(notification);
    } else {
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification);
    } else {
    }
  };
  const iconConfig = getNotificationIcon(notification.type);
  const hasBackgroundImage =
    notification.backgroundImage !== null &&
    notification.backgroundImage !== undefined;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon or Background Image */}
      {hasBackgroundImage ? (
        <ImageBackground
          source={notification.backgroundImage}
          style={styles.imageContainer}
          imageStyle={styles.imageStyle}
        >
          {/* Empty overlay - image is just for background */}
        </ImageBackground>
      ) : (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconConfig.backgroundColor },
          ]}
        >
          {iconConfig.library === "Feather" ? (
            <Feather
              name={iconConfig.name as any}
              size={20}
              color={iconConfig.color}
            />
          ) : iconConfig.library === "SimpleLineIcons" ? (
            <SimpleLineIcons
              name={iconConfig.name as any}
              size={20}
              color={iconConfig.color}
            />
          ) : (
            <Ionicons
              name={iconConfig.name as any}
              size={20}
              color={iconConfig.color}
            />
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.timeAgo}>{notification.timeAgo}</Text>
      </View>

      {/* Delete Button */}
      {/* <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Feather name="trash-2" size={18} color={color.gray69} />
      </TouchableOpacity> */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(230, 230, 230, 0.40)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: "hidden",
  },
  imageStyle: {
    borderRadius: 22,
    resizeMode: "cover",
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray69,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
});
