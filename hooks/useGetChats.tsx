import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { calculateTimeAgo } from "@/utils/helper";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ChatItem {
  id: string;
  matchId: string;
  userId: string;
  name: string;
  image: string;
  lastMessage: string;
  timestamp: string;
  timestampValue: number; // Store actual timestamp for sorting
  unreadCount: number;
  isOnline: boolean;
}

const IMAGE_BASE_URL = "https://api.andra-dating.com/images/";

const useGetChats = () => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseImages = (imagesStr: string, gender: string): string => {
    if (!imagesStr) {
      return getDefaultImage(gender);
    }

    try {
      let cleanedImagesString = imagesStr;
      if (cleanedImagesString.includes('\\"')) {
        cleanedImagesString = cleanedImagesString.replace(/\\"/g, '"');
      }
      if (cleanedImagesString.includes("\\\\")) {
        cleanedImagesString = cleanedImagesString.replace(/\\\\/g, "\\");
      }

      const imageFilenames = JSON.parse(cleanedImagesString);
      if (Array.isArray(imageFilenames) && imageFilenames.length > 0) {
        const validImages = imageFilenames
          .filter((filename) => filename && typeof filename === "string")
          .map((filename) => {
            const cleanFilename = filename.replace(/\\/g, "");
            return `${IMAGE_BASE_URL}${cleanFilename}`;
          });

        return validImages.length > 0
          ? validImages[0]
          : getDefaultImage(gender);
      } else {
        return getDefaultImage(gender);
      }
    } catch (error) {
      console.warn("Error parsing images:", error);
      return getDefaultImage(gender);
    }
  };

  const getDefaultImage = (gender: string): string => {
    const normalizedGender = (gender || "").toLowerCase();
    if (normalizedGender === "female" || normalizedGender === "f") {
      return "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";
    } else if (normalizedGender === "male" || normalizedGender === "m") {
      return "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
    } else {
      return "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";
    }
  };

  const loadChats = async () => {
    if (!user?.user_id) {
      setError(t("hooks.userIdNotAvailable"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use chat_list API to get all chats
      const chatListFormData = new FormData();
      chatListFormData.append("type", "chat_list");
      chatListFormData.append("user_id", user.user_id);

      const chatListResponse = await apiCall(chatListFormData);

      if (chatListResponse?.data && Array.isArray(chatListResponse.data)) {
        const chatList: ChatItem[] = chatListResponse.data.map((chat: any) => {
          // Parse chat data from API response
          const chatId = chat.id || chat.chat_id || chat.to_chat_id || "";
          const chatUserId = chat.user_id || chat.to_id || "";
          const chatUserName =
            chat.name || chat.user_name || t("matches.unknown");
          const chatUserImage = chat.image || chat.user_image || "";
          const chatUserGender = chat.gender || "unknown";

          // Get last message
          let lastMessage = t("chat.noMessagesYet");
          let lastTimestamp = 0;
          let unreadCount = 0;

          if (chat.last_message) {
            const lastMsg = chat.last_message;
            const fromId = chatListResponse.user?.id || user.user_id;
            const isLastMessageFromUser = lastMsg.from_id === fromId;

            // Format last message with "You:" prefix if sent by current user
            const rawMessage =
              lastMsg.msg || lastMsg.message || t("chat.noMessagesYet");
            lastMessage = isLastMessageFromUser
              ? `${t("chat.you")} ${rawMessage}`
              : rawMessage;

            // Truncate if too long
            if (lastMessage.length > 50) {
              lastMessage = lastMessage.substring(0, 50) + "...";
            }

            lastTimestamp =
              Number(lastMsg.datetime) || Number(lastMsg.timestamp) || 0;
          }

          // Get unread count
          unreadCount = Number(chat.unread_count) || 0;

          // Parse user image
          const userImage = chatUserImage
            ? chatUserImage.startsWith("http")
              ? chatUserImage
              : `${IMAGE_BASE_URL}${chatUserImage}`
            : parseImages(chat.images || "", chatUserGender);

          return {
            id: chatId,
            matchId: chatId, // to_chat_id is used as matchId for navigation
            userId: chatUserId,
            name: chatUserName,
            image: userImage,
            lastMessage: lastMessage,
            timestamp: lastTimestamp
              ? calculateTimeAgo(new Date(lastTimestamp * 1000))
              : "",
            timestampValue: lastTimestamp || 0,
            unreadCount: unreadCount,
            isOnline: chat.status === "1" || chat.is_online === "1",
          };
        });

        // Sort by unread count first (unread chats first), then by timestamp (most recent first)
        chatList.sort((a, b) => {
          // First sort by unread count (higher unread first)
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          // Then sort by timestamp (most recent first)
          return b.timestampValue - a.timestampValue;
        });

        setChats(chatList);
        setError(null);
      } else {
        // Fallback: If chat_list doesn't return expected format, use matches approach
        const matchesFormData = new FormData();
        matchesFormData.append("type", "get_data");
        matchesFormData.append("table_name", "matches");
        matchesFormData.append("user_id", user.user_id);

        const matchesResponse = await apiCall(matchesFormData);

        if (matchesResponse?.data && Array.isArray(matchesResponse.data)) {
          const chatList: ChatItem[] = [];

          // For each match, get the last message using getchat
          for (const match of matchesResponse.data) {
            if (match.match_id === "0" || !match.match) continue;

            const matchUser = match.match;
            const matchId = match.id; // Use match record ID as to_chat_id

            // Get chat history for this match
            try {
              const chatFormData = new FormData();
              chatFormData.append("type", "getchat");
              chatFormData.append("user_id", user.user_id);
              chatFormData.append("to_chat_id", matchId);

              const chatResponse = await apiCall(chatFormData);
              const chatMessages = chatResponse?.chat || [];

              // Get last message
              let lastMessage = t("chat.noMessagesYet");
              let lastTimestamp = 0;
              let unreadCount = 0;

              if (chatMessages.length > 0) {
                const lastMsg = chatMessages[chatMessages.length - 1];
                const fromId = chatResponse.user?.id || user.user_id;
                const isLastMessageFromUser = lastMsg.from_id === fromId;

                const rawMessage = lastMsg.msg || t("chat.noMessagesYet");
                lastMessage = isLastMessageFromUser
                  ? `${t("chat.you")} ${rawMessage}`
                  : rawMessage;

                if (lastMessage.length > 50) {
                  lastMessage = lastMessage.substring(0, 50) + "...";
                }

                lastTimestamp = Number(lastMsg.datetime) || Date.now();
                unreadCount = chatMessages.filter(
                  (msg: any) => msg.from_id !== fromId && !msg.read
                ).length;
              }

              const gender = matchUser.gender || "unknown";
              const userImage = parseImages(matchUser.images || "", gender);

              chatList.push({
                id: matchId,
                matchId: matchId,
                userId: match.match_id || matchUser.id || "",
                name: matchUser.name || t("matches.unknown"),
                image: userImage,
                lastMessage: lastMessage,
                timestamp: lastTimestamp
                  ? calculateTimeAgo(new Date(lastTimestamp * 1000))
                  : "",
                timestampValue: lastTimestamp || 0,
                unreadCount: unreadCount,
                isOnline: matchUser.status === "1",
              });
            } catch (chatError) {
              console.warn(
                `Failed to get chat for match ${matchId}:`,
                chatError
              );
              const gender = matchUser.gender || "unknown";
              const userImage = parseImages(matchUser.images || "", gender);

              chatList.push({
                id: matchId,
                matchId: matchId,
                userId: match.match_id || matchUser.id || "",
                name: matchUser.name || t("matches.unknown"),
                image: userImage,
                lastMessage: t("chat.noMessagesYet"),
                timestamp: "",
                timestampValue: 0,
                unreadCount: 0,
                isOnline: matchUser.status === "1",
              });
            }
          }

          // Sort by unread count first, then by timestamp
          chatList.sort((a, b) => {
            if (a.unreadCount !== b.unreadCount) {
              return b.unreadCount - a.unreadCount;
            }
            return b.timestampValue - a.timestampValue;
          });

          setChats(chatList);
          setError(null);
        } else {
          setChats([]);
          setError(null);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err.message || t("hooks.networkErrorCheckConnection");
      setError(errorMessage);
      console.error("Fetch chats error:", err);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      loadChats();
    }
  }, [user?.user_id]);

  return {
    loading,
    chats,
    error,
    refetch: loadChats,
  };
};

export default useGetChats;
