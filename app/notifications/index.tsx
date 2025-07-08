import NotificationCard from "@/components/notification_card";
import { NotificationsTabsHeader } from "@/components/tabs_header";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
}

export default function Notifications({ navigation }: any) {
  const { user } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case "reaction":
      case "emoji":
        return "😍";
      case "match":
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
  };

  const fetchNotifications = async () => {
    if (!user?.user_id) {
      setError("User session expired. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "notifications");
      formData.append("user_id", user.user_id);

      console.log("Fetching notifications for user:", user.user_id);

      const response = await apiCall(formData);

      if (response.result && Array.isArray(response.data)) {
        // Process the notifications data
        const processedNotifications = response.data.map(
          (notif: any, index: number) => ({
            id: notif.id || `notif_${index}`,
            type: notif.type || "general",
            title: notif.title || getNotificationTitle(notif.type),
            message: notif.message || notif.content || "",
            timeAgo: notif.created_at
              ? formatTimeAgo(notif.created_at)
              : "recently",
            isRead: notif.is_read || false,
            created_at: notif.created_at,
            user_name: notif.user_name || notif.from_user,
            emoji: getNotificationEmoji(notif.type || "general"),
          })
        );

        setNotifications(processedNotifications);
        setError(null);
      } else {
        // No notifications or result is false
        setNotifications([]);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications. Please try again.");
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type.toLowerCase()) {
      case "reaction":
      case "emoji":
        return "New Reaction";
      case "match":
        return "New Match!";
      case "profile_view":
      case "view":
        return "Profile View";
      case "event":
        return "Event Notification";
      case "message":
        return "New Message";
      case "like":
        return "Someone Liked You";
      case "nearby":
        return "Nearby User";
      case "super_like":
        return "Super Like!";
      default:
        return "Notification";
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

  const handleNotificationPress = (notification: Notification) => {
    console.log("Notification pressed:", notification);

    // Mark as read locally
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notification.id ? { ...notif, isRead: true } : notif
      )
    );

    // TODO: Call API to mark as read
    // markNotificationAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type.toLowerCase()) {
      case "reaction":
      case "emoji":
        console.log("Navigate to reactions");
        // router.push("/reactions");
        break;
      case "match":
        console.log("Navigate to matches");
        // router.push("/matches");
        break;
      case "profile_view":
      case "view":
        console.log("Navigate to profile views");
        // router.push("/profile-views");
        break;
      case "event":
        console.log("Navigate to events");
        // router.push("/events");
        break;
      case "message":
        console.log("Navigate to messages");
        // router.push("/messages");
        break;
      default:
        console.log("General notification tap");
        break;
    }
  };

  const handleDeleteNotification = (notification: Notification) => {
    // Remove locally
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== notification.id)
    );

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
      <Text style={styles.emptyTitle}>All quiet here!</Text>
      <Text style={styles.emptyText}>
        No notifications to show right now.{"\n"}
        We'll let you know when something exciting happens! ✨
      </Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color={color.white} />
        <Text style={styles.refreshButtonText}>Check Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyEmoji}>😕</Text>
      </View>
      <Text style={styles.emptyTitle}>Oops! Something went wrong</Text>
      <Text style={styles.emptyText}>{error}</Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRetry}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color={color.white} />
        <Text style={styles.refreshButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={color.primary} />
      <Text style={styles.loadingText}>Loading notifications...</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NotificationsTabsHeader
          title="Notifications"
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
        title="Notifications"
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
            title="Pull to refresh"
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
