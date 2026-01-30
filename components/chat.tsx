import CustomSearchBar from "@/components/custom_search";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import useGetChats from "@/hooks/useGetChats";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatItem {
  id: string;
  matchId: string;
  userId: string;
  name: string;
  image: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatList() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const { showToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const { chats, loading, error, refetch } = useGetChats();
  // Filter chats based on search text
  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleChatPress = (chat: ChatItem) => {
    router.push({
      pathname: "/chat/conversation",
      params: {
        matchId: chat.matchId,
        userId: chat.userId,
        userName: chat.name,
        userImage: chat.image,
      },
    });
  };

  const handleDeleteChat = (chat: ChatItem) => {
    Alert.alert(
      t("chat.deleteChat"),
      t("chat.deleteChatConfirm", { name: chat.name }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("chat.delete"),
          style: "destructive",
          onPress: async () => {
            if (!user?.user_id) {
              showToast(t("chat.userNotLoggedIn"), "error");
              return;
            }

            try {
              const formData = new FormData();
              formData.append("type", "chat_delete");
              formData.append("user_id", user.user_id);
              formData.append("to_chat_id", chat.matchId);

              const response = await apiCall(formData);
              if (response && response.result) {
                showToast(t("chat.chatDeleted"), "success");
                refetch(); // Refresh chat list
              } else {
                showToast(
                  response?.message || t("chat.failedToDelete"),
                  "error"
                );
              }
            } catch (error: any) {
              showToast(error?.message || t("chat.failedToDelete"), "error");

            }
          },
        },
      ]
    );
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
      onLongPress={() => handleDeleteChat(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.avatar}
          onError={() => {
            // Image failed to load, will show placeholder
          }}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={styles.emptyTitle}>{t("chat.noConversations")}</Text>
      <Text style={styles.emptyText}>{t("chat.startChatting")}</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>😔</Text>
      <Text style={styles.emptyTitle}>{t("chat.errorLoading")}</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>{t("common.tryAgain")}</Text>
      </TouchableOpacity>
    </View>
  );

  // Calculate total unread count
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("chat.chats")}</Text>
        {totalUnread > 0 && (
          <View style={styles.unreadHeaderBadge}>
            <Text style={styles.unreadHeaderText}>
              {totalUnread} {t("chat.unread")}
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomSearchBar
          searchText={searchText}
          onChangeText={setSearchText}
          placeholder={t("chat.searchConversations")}
        />
      </View>

      {/* Chat List */}
      {error && chats.length === 0 ? (
        renderErrorState()
      ) : loading && chats.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <Text style={styles.loadingText}>{t("chat.loading")}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            filteredChats.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={
            searchText.trim() ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t("chat.noResultsFound")}</Text>
              </View>
            ) : (
              renderEmptyState()
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={[color.primary]}
              tintColor={color.primary}
            />
          }
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: font.bold,
    color: color.black,
  },
  unreadHeaderBadge: {
    backgroundColor: color.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unreadHeaderText: {
    color: color.white,
    fontSize: 12,
    fontFamily: font.semiBold,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: color.white,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.gray94,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.gray94,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: color.success,
    borderWidth: 2,
    borderColor: color.white,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray55,
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: color.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: color.white,
    fontSize: 12,
    fontFamily: font.semiBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
  },
  retryButton: {
    backgroundColor: color.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryButtonText: {
    color: color.white,
    fontSize: 16,
    fontFamily: font.semiBold,
  },
});
