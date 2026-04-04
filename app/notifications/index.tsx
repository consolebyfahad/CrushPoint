import NotificationCard from "@/components/notification_card";
import { NotificationsTabsHeader } from "@/components/tabs_header";
import { useAppContext } from "@/context/app_context";
import useGetInterests from "@/hooks/useGetInterests";
import { apiCall } from "@/utils/api";
import {
  countUnreadNotifications,
  setAppIconBadgeCount,
} from "@/utils/appBadge";
import { color, font, image } from "@/utils/constants";
import {
  calculateAge,
  parseInterestsWithNames,
  parseJsonString,
  parseUserImages,
} from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  from?: any;
  from_id?: string;
  event_id?: string;
  event?: any;
  invite_id?: string;
}

export default function Notifications({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const { user, userData } = useAppContext();
  const { rawInterests } = useGetInterests();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user?.user_id) return;
      fetchNotifications();
    }, [user?.user_id]),
  );

  useEffect(() => {
    const unread = countUnreadNotifications(notifications);
    void setAppIconBadgeCount(unread);
  }, [notifications]);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return t("notifications.recently");

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return t("notifications.recently");
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1
        ? t("notifications.dayAgo", { count: days })
        : t("notifications.daysAgo", { count: days });
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return months === 1
        ? t("notifications.monthAgo", { count: months })
        : t("notifications.monthsAgo", { count: months });
    } else {
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
      case "profile_visit":
      case "view":
        return t("notifications.profileView");
      case "event":
      case "event_invite":
      case "event_invite_accepted":
      case "event_reminder":
      case "new_event":
        return t("notifications.eventNotification");
      case "message":
      case "chat":
      case "new_message":
        return t("notifications.newMessage");
      case "like":
      case "profile_like":
        return t("notifications.someoneLikedYou");
      case "nearby":
      case "nearby_users":
        return t("notifications.nearbyUser");
      case "super_like":
        return t("notifications.superLike");
      default:
        return t("notifications.notification");
    }
  };

  const translateNotificationTitle = (apiTitle: string, type: string) => {
    if (apiTitle) {
      const lowerTitle = apiTitle.toLowerCase();
      if (
        lowerTitle.includes("new message") ||
        lowerTitle.includes("neue nachricht")
      ) {
        return t("notifications.newMessage");
      }
      if (
        lowerTitle.includes("new match") ||
        lowerTitle.includes("neues match")
      ) {
        return t("notifications.newMatch");
      }
      if (lowerTitle.includes("reaction") || lowerTitle.includes("reaktion")) {
        return t("notifications.newReaction");
      }
      if (
        lowerTitle.includes("profile view") ||
        lowerTitle.includes("profilansicht")
      ) {
        return t("notifications.profileView");
      }
      if (
        lowerTitle.includes("event") ||
        lowerTitle.includes("veranstaltung")
      ) {
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

    return getNotificationTitle(type);
  };

  const translateNotificationMessage = (
    apiMessage: string,
    type: string,
    userName: string,
  ) => {
    if (!apiMessage) return "";

    const lowerMessage = apiMessage.toLowerCase();

    if (userName && apiMessage.includes(userName)) {
      if (
        lowerMessage.includes("new message") &&
        lowerMessage.includes("reply now")
      ) {
        return t("notifications.messageFromUserReply", { name: userName });
      }

      if (
        lowerMessage.includes("new match") &&
        lowerMessage.includes("start chatting")
      ) {
        return t("notifications.matchWithUserChat", { name: userName });
      }

      if (
        lowerMessage.includes("liked") &&
        lowerMessage.includes("your profile")
      ) {
        return t("notifications.likedYourProfile", { name: userName });
      }

      if (
        lowerMessage.includes("visited") &&
        (lowerMessage.includes("your profile") ||
          lowerMessage.includes("dein profil") ||
          lowerMessage.includes("dein profil besucht"))
      ) {
        return t("notifications.visitedYourProfile", { name: userName });
      }
    }

    if (
      lowerMessage.includes("liked") &&
      lowerMessage.includes("your profile")
    ) {
      return t("notifications.likedYourProfile", { name: userName || "" });
    }

    if (
      lowerMessage.includes("visited") &&
      (lowerMessage.includes("your profile") ||
        lowerMessage.includes("dein profil") ||
        lowerMessage.includes("profil besucht"))
    ) {
      return t("notifications.visitedYourProfile", { name: userName || "" });
    }

    if (
      lowerMessage.includes("new message from") ||
      lowerMessage.includes("neue nachricht von") ||
      lowerMessage.includes("you have a new message")
    ) {
      return t("notifications.messageFromUser", { name: userName });
    }

    if (
      lowerMessage.includes("new match with") ||
      lowerMessage.includes("neues match mit") ||
      lowerMessage.includes("you have a new match")
    ) {
      return t("notifications.matchWithUser", { name: userName });
    }

    if (
      lowerMessage.includes("start chatting") ||
      lowerMessage.includes("beginne zu chatten")
    ) {
      return t("notifications.startChatting");
    }

    if (
      lowerMessage.includes("reply now") ||
      lowerMessage.includes("jetzt antworten")
    ) {
      return t("notifications.replyNow");
    }

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
      if (Array.isArray(response.data)) {
        const processedNotifications = response.data.map(
          (notif: any, index: number) => {
            const notificationType = notif.type || "general";

            const backgroundImage =
              getNotificationBackgroundImage(notificationType);

            const translatedTitle = translateNotificationTitle(
              notif.title,
              notificationType,
            );
            const translatedMessage = translateNotificationMessage(
              notif.notification,
              notificationType,
              notif.from?.name || notif.user_name || "",
            );

            const fromWithEmoji =
              notif.from &&
              (notif.reaction ||
                notif.emoji ||
                (notif.from as any)?.match_emoji)
                ? {
                    ...notif.from,
                    match_emoji:
                      (notif.from as any)?.match_emoji ||
                      notif.reaction ||
                      notif.emoji,
                  }
                : notif.from;

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
              from: fromWithEmoji || null,
              from_id: notif.from_id || notif.from?.id || null,
              event_id: notif.event_id || notif.eventId || null,
              event: notif.event || null,
              invite_id: notif.invite_id ?? notif.event_invite_id ?? null,
            };

            return processed;
          },
        );
        setNotifications(processedNotifications);
        setError(null);
      } else {
        setNotifications([]);
        setError(null);
      }
    } catch (error) {
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
      case "profile_visit":
      case "view":
        return image.profileNotification;
      case "profile_like":
        return image.likeNotification;
      case "event":
      case "event_invite":
      case "event_invite_accepted":
      case "event_reminder":
      case "new_event":
        return image.eventNotification;
      case "message":
      case "new_message":
      case "chat":
        return image.chatNotification;
      default:
        return null;
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
    setNotifications((prevNotifications) => {
      const updated = prevNotifications.map((notif) =>
        notif.id === notification.id ? { ...notif, isRead: true } : notif,
      );
      return updated;
    });

    const notificationType = notification.type.toLowerCase();
    if (
      notificationType === "message" ||
      notificationType === "chat" ||
      notificationType === "new_message"
    ) {
      if (notification.from_id && notification.from) {
        try {
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
                  (m: any) => m.match_id === notification.from_id,
                );
                matchRecordId = matchRecord?.id || null;
              }
            } catch (error) {}
          }

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
                      notification.from.gender || "unknown",
                    )[0]
                : "",
            },
          });
          return;
        } catch (error) {
          router.push("/(tabs)/matches");
          return;
        }
      } else {
        router.push("/(tabs)/matches");
        return;
      }
    }

    if (notificationType === "new_match" || notificationType === "match") {
      if (notification.from && notification.from_id) {
        try {
          const imagesString = notification.from.images || "[]";
          const parsedImages = parseUserImages(
            imagesString,
            notification.from.gender || "unknown",
          );

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

          let currentUserImage = "";

          if (
            userData?.photos &&
            Array.isArray(userData.photos) &&
            userData.photos.length > 0
          ) {
            currentUserImage = userData.photos[0];
          } else if (
            userData?.images &&
            Array.isArray(userData.images) &&
            userData.images.length > 0
          ) {
            currentUserImage = userData.images[0].startsWith("http")
              ? userData.images[0]
              : `https://api.andra-dating.com/images/${userData.images[0]}`;
          } else {
            currentUserImage =
              userData?.gender === "female"
                ? "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg"
                : "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
          }

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
              distance: "0 km",
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

          router.push("/(tabs)/matches");
          return;
        } catch (error) {
          router.push("/(tabs)/matches");
          return;
        }
      } else {
        router.push("/(tabs)/matches");
        return;
      }
    }

    const eventTypes = [
      "event_invite",
      "event_invite_accepted",
      "event_reminder",
      "new_event",
    ];
    if (eventTypes.includes(notificationType)) {
      console.log("notification data", JSON.stringify(notification));
      const eventId = (notification as Notification & { event_id?: string })
        .event_id;
      const eventObj = (notification as Notification & { event?: any }).event;
      const inviteId = notification.invite_id ?? null;
      console.log("inviteId", inviteId);
      if (eventId || eventObj) {
        const params: Record<string, string> = {};
        if (eventObj && typeof eventObj === "object") {
          params.event = JSON.stringify(eventObj);
        } else if (eventId) {
          params.eventId = String(eventId);
        }
        if (inviteId && notificationType === "event_invite") {
          params.inviteId = String(inviteId);
        }
        console.log("event details params", params);
        if (Object.keys(params).length > 0) {
          router.push({
            pathname: "/events/event_details",
            params,
          });
          return;
        }
      }

      router.push("/(tabs)/events");
      return;
    }

    if (notification.from && notification.from_id) {
      try {
        const imagesString = notification.from.images || "[]";
        const parsedImages = parseUserImages(
          imagesString,
          notification.from.gender || "unknown",
        );

        const lookingForString = notification.from.looking_for || "[]";
        let parsedLookingFor: string[] = [];
        try {
          parsedLookingFor = parseJsonString(lookingForString);
        } catch (error) {
          parsedLookingFor = [];
        }

        const interestsString = notification.from.interests || "[]";
        let parsedInterests: string[] = [];
        try {
          parsedInterests = parseInterestsWithNames(
            interestsString,
            rawInterests || [],
            i18n.language || "en",
          );
        } catch (error) {
          try {
            parsedInterests = parseJsonString(interestsString);
          } catch (fallbackError) {
            parsedInterests = [];
          }
        }

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
          parsedNationality = [];
        }

        const userAge = notification.from.dob
          ? calculateAge(notification.from.dob)
          : 0;

        const userHeight =
          notification.from.height &&
          notification.from.height !== "0" &&
          notification.from.height.trim() !== ""
            ? notification.from.height
            : "";

        const notificationType = (notification.type || "").toLowerCase();
        const matchEmojiFromType =
          notificationType === "like"
            ? "like"
            : notificationType === "super_like"
              ? "super_like"
              : notificationType === "match" || notificationType === "new_match"
                ? "like"
                : notificationType === "emoji" ||
                    notificationType === "reaction"
                  ? "like"
                  : "";
        const match_emoji =
          (notification.from as any)?.match_emoji ?? matchEmojiFromType;
        const match_status =
          (notification.from as any)?.match_status ??
          (match_emoji ? "matched" : "");

        const userProfileData = {
          id: notification.from.id || notification.from_id,
          name: notification.from.name || notification.user_name || "User",
          age: userAge,
          images: parsedImages,
          about: notification.from.about || "",
          height: userHeight,
          nationality: parsedNationality,
          religion: notification.from.religion || "",
          zodiac: notification.from.zodiac || "",
          gender: notification.from.gender || "",
          country: notification.from.country || "",
          state: notification.from.state || "",
          city: notification.from.city || "",
          languages: notification.from.languages || "",
          interests: parsedInterests,
          lookingFor: parsedLookingFor,
          phone: notification.from.phone || "",
          dob: notification.from.dob || "",
          lat: notification.from.lat || "",
          lng: notification.from.lng || "",
          email: notification.from.email || "",
          radius: notification.from.radius || "",
          uploaded_selfie: notification.from.uploaded_selfie || "",
          match_emoji,
          match_status,
        };
        router.push({
          pathname: "/profile/user_profile",
          params: {
            user: JSON.stringify(userProfileData),
            userId: userProfileData.id,
          },
        });
      } catch (error) {}
    } else {
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
          break;
      }
    }
  };

  const handleDeleteNotification = (notification: Notification) => {
    setNotifications((prevNotifications) => {
      const filtered = prevNotifications.filter(
        (notif) => notif.id !== notification.id,
      );
      return filtered;
    });
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

      {}
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
