import NotificationCard from "@/components/notification_card";
import { NotificationsTabsHeader } from "@/components/tabs_header";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font, image } from "@/utils/constants";
import { parseJsonString, parseUserImages } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  created_at?: string;
  user_name?: string;
  emoji?: string;
  backgroundImage?: any;
  from?: any; // User data from notification
  from_id?: string; // User ID from notification
}

export default function Notifications({ navigation }: any) {
  const { t } = useTranslation();
  const { user, userData } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return t("notifications.recently");

    // Parse the date string - format: "Nov 01, 2025 08:45 PM"
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return t("notifications.recently");
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // If negative (future date), return recently
    if (diffInSeconds < 0) {
      return t("notifications.recently");
    }

    if (diffInSeconds < 60) {
      return t("notifications.justNow");
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return minutes === 1
        ? t("notifications.minuteAgo", { count: minutes })
        : t("notifications.minutesAgo", { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1
        ? t("notifications.hourAgo", { count: hours })
        : t("notifications.hoursAgo", { count: hours });
    } else if (diffInSeconds < 2592000) {
      // Less than 30 days
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1
        ? t("notifications.dayAgo", { count: days })
        : t("notifications.daysAgo", { count: days });
    } else if (diffInSeconds < 31536000) {
      // Less than 1 year (365 days)
      const months = Math.floor(diffInSeconds / 2592000);
      return months === 1
        ? t("notifications.monthAgo", { count: months })
        : t("notifications.monthsAgo", { count: months });
    } else {
      // More than 1 year
      const years = Math.floor(diffInSeconds / 31536000);
      return years === 1
        ? t("notifications.yearAgo", { count: years })
        : t("notifications.yearsAgo", { count: years });
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type.toLowerCase()) {
      case "reaction":
      case "emoji":
        return t("notifications.newReaction");
      case "match":
      case "new_match":
        return t("notifications.newMatch");
      case "profile_view":
      case "view":
        return t("notifications.profileView");
      case "event":
        return t("notifications.eventNotification");
      case "message":
      case "chat":
      case "new_message":
        return t("notifications.newMessage");
      case "like":
        return t("notifications.someoneLikedYou");
      case "nearby":
        return t("notifications.nearbyUser");
      case "super_like":
        return t("notifications.superLike");
      default:
        return t("notifications.notification");
    }
  };

  const translateNotificationTitle = (apiTitle: string, type: string) => {
    // If API title matches common patterns, translate it
    if (apiTitle) {
      const lowerTitle = apiTitle.toLowerCase();
      if (lowerTitle.includes("new message") || lowerTitle.includes("neue nachricht")) {
        return t("notifications.newMessage");
      }
      if (lowerTitle.includes("new match") || lowerTitle.includes("neues match")) {
        return t("notifications.newMatch");
      }
      if (lowerTitle.includes("reaction") || lowerTitle.includes("reaktion")) {
        return t("notifications.newReaction");
      }
      if (lowerTitle.includes("profile view") || lowerTitle.includes("profilansicht")) {
        return t("notifications.profileView");
      }
      if (lowerTitle.includes("event") || lowerTitle.includes("veranstaltung")) {
        return t("notifications.eventNotification");
      }
      if (lowerTitle.includes("like")) {
        return t("notifications.someoneLikedYou");
      }
      if (lowerTitle.includes("nearby") || lowerTitle.includes("in der nähe")) {
        return t("notifications.nearbyUser");
      }
      if (lowerTitle.includes("super like")) {
        return t("notifications.superLike");
      }
    }

    // Fallback to type-based translation
    return getNotificationTitle(type);
  };

  const translateNotificationMessage = (
    apiMessage: string,
    type: string,
    userName: string
  ) => {
    if (!apiMessage) return "";

    // Translate common notification message patterns
    const lowerMessage = apiMessage.toLowerCase();

    // If message contains user name, try to preserve it in translation
    if (userName && apiMessage.includes(userName)) {
      // For new message: "You have a new message from {name}! Reply now."
      if (
        lowerMessage.includes("new message") &&
        lowerMessage.includes("reply now")
      ) {
        return t("notifications.messageFromUserReply", { name: userName });
      }

      // For new match: "You have a new match with {name}! Start chatting now."
      if (
        lowerMessage.includes("new match") &&
        lowerMessage.includes("start chatting")
      ) {
        return t("notifications.matchWithUserChat", { name: userName });
      }
    }

    // New message notifications
    if (
      lowerMessage.includes("new message from") ||
      lowerMessage.includes("neue nachricht von") ||
      lowerMessage.includes("you have a new message")
    ) {
      return t("notifications.messageFromUser", { name: userName });
    }

    // New match notifications
    if (
      lowerMessage.includes("new match with") ||
      lowerMessage.includes("neues match mit") ||
      lowerMessage.includes("you have a new match")
    ) {
      return t("notifications.matchWithUser", { name: userName });
    }

    // Start chatting notifications
    if (
      lowerMessage.includes("start chatting") ||
      lowerMessage.includes("beginne zu chatten")
    ) {
      return t("notifications.startChatting");
    }

    // Reply now notifications
    if (
      lowerMessage.includes("reply now") ||
      lowerMessage.includes("jetzt antworten")
    ) {
      return t("notifications.replyNow");
    }

    // Return original message if no pattern matches
    return apiMessage;
  };

  const fetchNotifications = async () => {
    if (!user?.user_id) {
      setError(t("notifications.userSessionExpired"));
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "notifications");
      formData.append("user_id", user.user_id);

      const response = await apiCall(formData);
      console.log("response for get notifications", JSON.stringify(response));
      if (Array.isArray(response.data)) {
        // Process the notifications data
        const processedNotifications = response.data.map(
          (notif: any, index: number) => {
            const notificationType = notif.type || "general";

            // Get background image based on type
            const backgroundImage =
              getNotificationBackgroundImage(notificationType);

            // Translate notification title and message
            const translatedTitle = translateNotificationTitle(
              notif.title,
              notificationType
            );
            const translatedMessage = translateNotificationMessage(
              notif.notification,
              notificationType,
              notif.from?.name || notif.user_name || ""
            );

            const processed = {
              id: notif.id || `notif_${index}`,
              type: notificationType,
              title: translatedTitle,
              message: translatedMessage,
              timeAgo:
                notif.timestamp || notif.created_at
                  ? formatTimeAgo(notif.timestamp || notif.created_at)
                  : t("notifications.recently"),
              isRead:
                notif.seen === "1" ||
                notif.seen === 1 ||
                notif.is_read ||
                false,
              created_at: notif.timestamp || notif.created_at,
              user_name: notif.user_name || notif.from?.name || notif.from_user,
              emoji: getNotificationEmoji(notificationType),
              backgroundImage: backgroundImage,
              from: notif.from || null, // Store full user object
              from_id: notif.from_id || notif.from?.id || null, // Store user ID
            };

            return processed;
          }
        );

        setNotifications(processedNotifications);
        setError(null);
      } else {
        // No notifications or result is false
        setNotifications([]);
        setError(null);
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);

      setError(t("notifications.failedToLoad"));
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };


  const getNotificationEmoji = (emoji: string) => {
    switch (emoji.toLowerCase()) {
      case "reaction":
      case "emoji":
        return "😍";
      case "match":
      case "new_match":
        return "💖";
      case "profile_view":
      case "view":
        return "👀";
      case "event":
        return "🎉";
      case "message":
        return "💬";
      case "like":
        return "❤️";
      case "nearby":
        return "📍";
      case "super_like":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const getNotificationBackgroundImage = (type: string) => {
    switch (type.toLowerCase()) {
      case "match":
      case "new_match":
        return image.matchNotification;
      case "profile_view":
      case "view":
        return image.profileNotification;
      case "event":
        return image.eventNotification;
      case "message":
      case "chat":
        return image.chatNotification;
      default:
        return null; // No background image for other types
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read locally
    setNotifications((prevNotifications) => {
      const updated = prevNotifications.map((notif) =>
        notif.id === notification.id ? { ...notif, isRead: true } : notif
      );
      return updated;
    });

    // TODO: Call API to mark as read
    // markNotificationAsRead(notification.id);

    const notificationType = notification.type.toLowerCase();

    // Handle chat/message notifications - redirect to chat conversation
    if (
      notificationType === "message" ||
      notificationType === "chat" ||
      notificationType === "new_message"
    ) {
      // If notification has match_id and user data, navigate to chat conversation
      if (notification.from_id && notification.from) {
        try {
          // Try to find match record ID
          let matchRecordId: string | null = null;
          if (user?.user_id) {
            try {
              const formData = new FormData();
              formData.append("type", "get_data");
              formData.append("table_name", "matches");
              formData.append("user_id", user.user_id);

              const response = await apiCall(formData);
              if (response?.data && Array.isArray(response.data)) {
                const matchRecord = response.data.find(
                  (m: any) => m.match_id === notification.from_id
                );
                matchRecordId = matchRecord?.id || null;
              }
            } catch (error) {
              console.warn("Failed to find match record:", error);
            }
          }

          // Navigate to chat conversation
          router.push({
            pathname: "/chat/conversation",
            params: {
              matchId: matchRecordId || notification.from_id,
              userId: notification.from_id,
              userName:
                notification.from.name || notification.user_name || "User",
              userImage: notification.from.images
                ? Array.isArray(notification.from.images)
                  ? notification.from.images[0]
                  : parseUserImages(
                      notification.from.images,
                      notification.from.gender || "unknown"
                    )[0]
                : "",
            },
          });
          return;
        } catch (error) {
          console.error("Error navigating to chat:", error);
          // Fallback to chat list
          router.push("/(tabs)/matches");
          return;
        }
      } else {
        // No user data, fallback to chat list
        router.push("/(tabs)/matches");
        return;
      }
    }

    // Handle new match notification - navigate to match2 screen
    if (notificationType === "new_match" || notificationType === "match") {
      if (notification.from && notification.from_id) {
        try {
          // Parse images from JSON string to array
          const imagesString = notification.from.images || "[]";
          const parsedImages = parseUserImages(
            imagesString,
            notification.from.gender || "unknown"
          );

          // Calculate age from DOB
          const calculateAge = (dob: string) => {
            if (!dob) return 0;
            try {
              const birthDate = new Date(dob);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
              ) {
                age--;
              }
              return age;
            } catch (error) {
              return 0;
            }
          };

          // Get current user image from userData
          let currentUserImage = "";

          // Try to get from userData.photos (already parsed URLs)
          if (
            userData?.photos &&
            Array.isArray(userData.photos) &&
            userData.photos.length > 0
          ) {
            currentUserImage = userData.photos[0];
          }
          // Fallback to images array
          else if (
            userData?.images &&
            Array.isArray(userData.images) &&
            userData.images.length > 0
          ) {
            currentUserImage = userData.images[0].startsWith("http")
              ? userData.images[0]
              : `https://api.andra-dating.com/images/${userData.images[0]}`;
          }
          // Final fallback based on gender
          else {
            currentUserImage =
              userData?.gender === "female"
                ? "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg"
                : "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
          }

          // Build match data for match2 screen
          const matchData = {
            currentUser: {
              name: userData?.name || user?.name || "You",
              image: currentUserImage,
              lat: userData?.lat?.toString() || "",
              lng: userData?.lng?.toString() || "",
            },
            matchedUser: {
              id: notification.from.id || notification.from_id,
              name: notification.from.name || notification.user_name || "User",
              age: calculateAge(notification.from.dob),
              distance: "0 km", // Distance not available in notification
              image: parsedImages[0] || "",
              images: parsedImages,
              about: notification.from.about || "",
              city: notification.from.city || "",
              country: notification.from.country || "",
              state: notification.from.state || "",
              gender: notification.from.gender || "",
              height: notification.from.height || "",
              nationality: notification.from.nationality || "",
              religion: notification.from.religion || "",
              zodiac: notification.from.zodiac || "",
              languages: notification.from.languages || "",
              interests: notification.from.interests || "[]",
              lookingFor: notification.from.looking_for || "[]",
              lat: notification.from.lat || "",
              lng: notification.from.lng || "",
              email: notification.from.email || "",
              phone: notification.from.phone || "",
              timestamp: notification.created_at || "",
              uploaded_selfie: notification.from.uploaded_selfie || "",
            },
          };

          router.push({
            pathname: "/profile/match2",
            params: {
              matchData: JSON.stringify(matchData),
            },
          });
          return;
        } catch (error) {
          console.error("Error navigating to match2 from notification:", error);
          // Fallback to matches screen
          router.push("/(tabs)/matches");
          return;
        }
      } else {
        // No user data, fallback to matches screen
        router.push("/(tabs)/matches");
        return;
      }
    }

    // Navigate to user profile if user data is available (for other notifications)
    if (notification.from && notification.from_id) {
      try {
        // Parse images from JSON string to array
        const imagesString = notification.from.images || "[]";
        const parsedImages = parseUserImages(
          imagesString,
          notification.from.gender || "unknown"
        );

        // Parse lookingFor from JSON string to array
        const lookingForString = notification.from.looking_for || "[]";
        let parsedLookingFor: string[] = [];
        try {
          parsedLookingFor = parseJsonString(lookingForString);
        } catch (error) {
          console.warn("Error parsing lookingFor:", error);
          parsedLookingFor = [];
        }

        // Parse interests from JSON string to array
        const interestsString = notification.from.interests || "[]";
        let parsedInterests: string[] = [];
        try {
          parsedInterests = parseJsonString(interestsString);
        } catch (error) {
          console.warn("Error parsing interests:", error);
          parsedInterests = [];
        }

        // Parse nationality from JSON string to array
        const nationalityString = notification.from.nationality || "[]";
        let parsedNationality: string[] = [];
        try {
          if (nationalityString && typeof nationalityString === "string") {
            if (
              nationalityString.startsWith("[") &&
              nationalityString.endsWith("]")
            ) {
              parsedNationality = parseJsonString(nationalityString);
            } else {
              parsedNationality = [nationalityString];
            }
          }
        } catch (error) {
          console.warn("Error parsing nationality:", error);
          parsedNationality = [];
        }

        // Format user data for profile navigation
        const userProfileData = {
          id: notification.from.id || notification.from_id,
          name: notification.from.name || notification.user_name || "User",
          images: parsedImages, // Use parsed array instead of string
          about: notification.from.about || "",
          height: notification.from.height || "",
          nationality: parsedNationality, // Use parsed array
          religion: notification.from.religion || "",
          zodiac: notification.from.zodiac || "",
          gender: notification.from.gender || "",
          country: notification.from.country || "",
          state: notification.from.state || "",
          city: notification.from.city || "",
          languages: notification.from.languages || "",
          interests: parsedInterests, // Use parsed array
          lookingFor: parsedLookingFor, // Use parsed array
          phone: notification.from.phone || "",
          dob: notification.from.dob || "",
          lat: notification.from.lat || "",
          lng: notification.from.lng || "",
          email: notification.from.email || "",
          radius: notification.from.radius || "",
          uploaded_selfie: notification.from.uploaded_selfie || "",
        };

        router.push({
          pathname: "/profile/user_profile",
          params: {
            user: JSON.stringify(userProfileData),
            userId: userProfileData.id,
          },
        });
      } catch (error) {
        console.error("Error navigating to user profile:", error);
      }
    } else {
      // Fallback navigation based on notification type if no user data
      switch (notificationType) {
        case "event":
          router.push("/(tabs)/events");
          break;
        case "message":
        case "chat":
        case "new_message":
          router.push("/(tabs)/matches");
          break;
        default:
          // For other types without user data, do nothing
          break;
      }
    }
  };

  const handleDeleteNotification = (notification: Notification) => {
    // Remove locally
    setNotifications((prevNotifications) => {
      const filtered = prevNotifications.filter(
        (notif) => notif.id !== notification.id
      );
      return filtered;
    });

    // TODO: Call API to delete notification
    // deleteNotification(notification.id);
  };

  const renderNotificationCard = ({ item }: { item: Notification }) => (
    <NotificationCard
      notification={item}
      onPress={handleNotificationPress}
      onDelete={handleDeleteNotification}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyEmoji}>🔔</Text>
        <Text style={styles.emptyEmojiSub}>💤</Text>
      </View>
      <Text style={styles.emptyTitle}>{t("notifications.allQuietHere")}</Text>
      <Text style={styles.emptyText}>
        {t("notifications.noNotificationsText")}
      </Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color={color.white} />
        <Text style={styles.refreshButtonText}>
          {t("notifications.checkAgain")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyEmoji}>😕</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {t("notifications.oopsSomethingWentWrong")}
      </Text>
      <Text style={styles.emptyText}>{error}</Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRetry}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color={color.white} />
        <Text style={styles.refreshButtonText}>{t("common.tryAgain")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={color.primary} />
      <Text style={styles.loadingText}>
        {t("notifications.loadingNotifications")}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NotificationsTabsHeader
          title={t("notifications.notifications")}
          notifications={[]}
          close={handleClose}
        />
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NotificationsTabsHeader
        title={t("notifications.notifications")}
        notifications={notifications}
        close={handleClose}
      />

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={error ? renderErrorState : renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[color.primary]}
            tintColor={color.primary}
            title={t("notifications.pullToRefresh")}
            titleColor={color.gray55}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    flex: 1,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8F9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
    borderWidth: 2,
    borderColor: "#E8EAFF",
  },
  emptyEmoji: {
    fontSize: 48,
    textAlign: "center",
  },
  emptyEmojiSub: {
    fontSize: 20,
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.white,
  },
});
