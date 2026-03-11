import ReportUser from "@/components//report_user";
import BlockConfirmation from "@/components/block_option";
import CustomSearchBar from "@/components/custom_search";
import ProfileOptions from "@/components/profile_options";
import RemoveMatch from "@/components/remove_match";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import useGetChats from "@/hooks/useGetChats";
import useGetMatches from "@/hooks/useGetMatches";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Match {
  id: string;
  name: string;
  age: number;
  image?: string;
  images?: string[];
  isOnline?: boolean;
  match_id?: string;
  [key: string]: any;  
}

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

export default function Matches() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const { showToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);
  const [showRemoveMatch, setShowRemoveMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const { matches, loading, error, refetch, removeMatch, updateMatchStatus } =
    useGetMatches();
  
  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    refetch: refetchChats,
  } = useGetChats();

  const filteredMatches = matches.filter((match) =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchesWithoutChat = filteredMatches.filter(
    (match) =>
      !chats.some(
        (chat) => String(chat.userId) === String(match.match_id || match.id)
      )
  );

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenConversation = useCallback(
    (match: any) => {

      const matchedUserId = String(match.match_id || match.id);
      const userName = match.name || "";
      const userImage =
        match.image ||
        (match.images && match.images.length > 0 ? match.images[0] : "");

      const existingChat = chats.find(
        (chat) => String(chat.userId) === matchedUserId
      );
      const matchId = existingChat ? existingChat.matchId : matchedUserId;
      router.push({
        pathname: "/chat/conversation",
        params: {
          matchId: matchId,
          userId: matchedUserId,  
          userName: userName,
          userImage: userImage,
          userAge: match.age != null ? String(match.age) : undefined,
          userTimeAgo: match.timeAgo ?? undefined,
          match_status: match.match_status ?? match.status,
          match_emoji: match.emoji ?? match.match_emoji,
        },
      });
    },
    [chats]
  );

  const handleNavigateToRemoveMatch = useCallback(() => {
    setShowProfileOptions(false);
    setShowRemoveMatch(true);
  }, []);

  const handleNavigateToBlock = useCallback(() => {
    setShowProfileOptions(false);
    setShowBlockConfirmation(true);
  }, []);

  const handleNavigateToReport = useCallback(() => {
    setShowProfileOptions(false);
    setShowReportUser(true);
  }, []);

  const handleBackToProfileOptions = useCallback(() => {
    setShowBlockConfirmation(false);
    setShowReportUser(false);
    setShowRemoveMatch(false);
    setShowProfileOptions(true);
  }, []);

  const handleRemoveMatch = useCallback(async () => {
    try {
      if (selectedMatch) {
        
        const formData = new FormData();
        formData.append("type", "delete_data");
        formData.append("table_name", "matches");
        formData.append("user_id", user?.user_id || "");
        formData.append("id", selectedMatch.id);

        const response = await apiCall(formData);

        if (response.result) {
          
          removeMatch(selectedMatch.match_id);
        } else {
        }
      }
    } catch (error) {
    } finally {
      setShowRemoveMatch(false);
      setSelectedMatch(null);
    }
  }, [selectedMatch, removeMatch]);

  const handleConfirmBlock = useCallback(async () => {
    try {
      if (selectedMatch) {
        
        const blockFormData = new FormData();
        blockFormData.append("type", "add_data");
        blockFormData.append("user_id", user?.user_id || "");
        blockFormData.append("table_name", "blocked_users");
        blockFormData.append("block_id", selectedMatch.match_id);
        
        const blockResponse = await apiCall(blockFormData);

      }
    } catch (error) {
    } finally {
      setShowBlockConfirmation(false);
      setSelectedMatch(null);
    }
  }, [selectedMatch, user?.user_id, removeMatch]);

  const handleSubmitReport = useCallback(
    async (reportData: any) => {
      try {
        if (selectedMatch) {
          
          const formData = new FormData();
          formData.append("type", "add_data");
          formData.append("table_name", "Reported_users");
          formData.append("user_id", user?.user_id || "");
          formData.append("reported_user_id", selectedMatch.match_id);
          formData.append("reason", reportData.reason);
          formData.append("description", reportData.description || "");
          const response = await apiCall(formData);
          if (response.result) {
            
            removeMatch(selectedMatch.match_id);
          } else {
          }
        }
      } catch (error) {
      } finally {
        setShowReportUser(false);
        setSelectedMatch(null);
      }
    },
    [selectedMatch, user?.user_id, removeMatch]
  );

  const renderHorizontalMatchCard: ListRenderItem<Match> = useCallback(
    ({ item }) => {
      const imageSource = item?.image
        ? { uri: item.image }
        : item?.images && item.images.length > 0
        ? { uri: item.images[0] }
        : undefined;

      return (
        <TouchableOpacity
          style={styles.horizontalMatchCard}
          onPress={() => handleOpenConversation(item)}
          activeOpacity={0.8}
        >
          <View style={styles.horizontalMatchImageContainer}>
            {imageSource ? (
              <Image source={imageSource} style={styles.horizontalMatchImage} />
            ) : (
              <View
                style={[styles.horizontalMatchImage, styles.placeholderImage]}
              >
                <Text style={styles.placeholderText}>
                  {item?.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
            {item?.isOnline && (
              <View style={styles.horizontalOnlineIndicator} />
            )}
          </View>
          <Text style={styles.horizontalMatchName} numberOfLines={1}>
            {item?.name || t("matches.unknown")}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleOpenConversation, t]
  );

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
              
              formData.append("to_chat_id", chat.userId);

              const response = await apiCall(formData);
              if (response && response.result) {
                showToast(t("chat.chatDeleted"), "success");
                refetch();  
                refetchChats();  
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

  const renderChatItem: ListRenderItem<ChatItem> = useCallback(
    ({ item }) => {
      const matchForUser = matches.find(
        (m) => String(m.match_id) === String(item.userId)
      );
      return (
        <TouchableOpacity
          style={styles.chatItem}
          onLongPress={() => handleDeleteChat(item)}
          onPress={() => {
            handleOpenConversation({
              ...item,
              match_id: item.userId,
              id: item.userId,
              match_status: matchForUser?.status,
              emoji: matchForUser?.emoji,
              age: matchForUser?.age,
              timeAgo: matchForUser?.timeAgo,
            });
          }}
          activeOpacity={0.7}
        >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.avatar}
            onError={() => {
              
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
    },
    [matches, handleOpenConversation]
  );

  const matchKeyExtractor = useCallback(
    (item: Match) => `match-${item.id}`,
    []
  );
  const chatKeyExtractor = useCallback(
    (item: ChatItem) => `chat-${item.id}`,
    []
  );

  const renderLoadingState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>{t("matches.loadingMatches")}</Text>
      </View>
    ),
    [t]
  );

  if (loading && matches.length === 0) {
    return renderLoadingState();
  }

  return (
    <View style={styles.container}>
      {}
      <CustomSearchBar
        searchText={searchText}
        onChangeText={setSearchText}
        placeholder={t("matches.searchMatches")}
      />

      {}
      {matchesWithoutChat.length > 0 && (
        <View style={styles.horizontalMatchesContainer}>
          <FlatList
            data={matchesWithoutChat}
            renderItem={renderHorizontalMatchCard}
            keyExtractor={matchKeyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalMatchesList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            initialNumToRender={5}
          />
        </View>
      )}

      {}
      {filteredChats.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("chat.chats")}</Text>
        </View>
      )}

      {}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={chatKeyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.chatsListContainer,
          filteredChats.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={
          chatsError && chats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>😔</Text>
              <Text style={styles.emptyTitle}>{t("chat.errorLoading")}</Text>
              <Text style={styles.emptyText}>{chatsError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={refetchChats}
              >
                <Text style={styles.retryButtonText}>
                  {t("common.tryAgain")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredChats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>{t("chat.noConversations")}</Text>
              <Text style={styles.emptyText}>{t("chat.startChatting")}</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={loading || chatsLoading}
            onRefresh={() => {
              refetch();
              refetchChats();
            }}
            colors={[color.primary]}
            tintColor={color.primary}
          />
        }
        
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={3}
        windowSize={10}
      />

      {}
      <ProfileOptions
        visible={showProfileOptions}
        onClose={() => {
          setShowProfileOptions(false);
          setSelectedMatch(null);
        }}
        onRemoveMatch={handleNavigateToRemoveMatch}
        onBlock={handleNavigateToBlock}
        onReport={handleNavigateToReport}
        userData={selectedMatch}
        isMatch={true}
      />

      {}
      <RemoveMatch
        visible={showRemoveMatch}
        onClose={() => setShowRemoveMatch(false)}
        onBack={handleBackToProfileOptions}
        onConfirm={handleRemoveMatch}
        userName={selectedMatch?.name}
      />

      {}
      <BlockConfirmation
        visible={showBlockConfirmation}
        onClose={() => setShowBlockConfirmation(false)}
        onBack={handleBackToProfileOptions}
        onConfirm={handleConfirmBlock}
        userName={selectedMatch?.name}
      />

      {}
      <ReportUser
        visible={showReportUser}
        onClose={() => setShowReportUser(false)}
        onBack={handleBackToProfileOptions}
        onSubmit={handleSubmitReport}
        userName={selectedMatch?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  
  horizontalMatchesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  horizontalMatchesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  horizontalMatchCard: {
    alignItems: "center",
    marginRight: 12,
    width: 80,
  },
  horizontalMatchImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  horizontalMatchImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: color.gray94,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.gray94,
  },
  placeholderText: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.gray55,
  },
  horizontalOnlineIndicator: {
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
  horizontalMatchName: {
    fontSize: 12,
    fontFamily: font.medium,
    color: color.black,
    textAlign: "center",
  },
  
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: color.white,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: font.bold,
    color: color.black,
  },
  
  chatsListContainer: {
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
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
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: color.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  retryButtonText: {
    color: color.white,
    fontSize: 16,
    fontFamily: font.semiBold,
  },
});
