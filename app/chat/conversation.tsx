import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: number;
  userId?: string;
}

export default function ChatConversation() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { user, userData } = useAppContext();
  console.log("user", userData);
  const { showToast } = useToast();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const matchId = params.matchId as string; // Match record ID (from matches table)
  const otherUserId = params.userId as string; // Matched user's ID (should be used as to_chat_id)
  const userName = params.userName as string;
  const userImage = params.userImage as string;

  console.log("💬 [Chat] Conversation params:", {
    matchId, // Match record ID (e.g., "26")
    otherUserId, // Matched user ID (e.g., "1") - this should be used as to_chat_id
    userName,
    userImage,
    currentUserId: userData?.id,
  });
  console.log("currentUserId", user?.user_id);
  // Validate required params
  useEffect(() => {
    if (!matchId || !otherUserId || !user?.user_id) {
      showToast(t("chat.invalidConversation"), "error");
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  }, [matchId, otherUserId, user?.user_id]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageTimestampRef = useRef<number>(0);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Fetch full chat history (getchat API)
  // to_chat_id should be the matched user's ID (otherUserId), not the match record ID
  const fetchChatHistory = useCallback(
    async (
      currentUserId: string,
      toChatId: string,
      userIdParam: string,
      showLoading = true
    ) => {
      if (showLoading) {
        setIsLoading(true);
      }
      console.log("📤 [Chat] Fetching chat history", {
        toChatId, // This should be the matched user's ID (otherUserId)
        userIdParam, // Current user's ID
        matchId, // Match record ID (for reference only)
      });
      const formData = new FormData();
      formData.append("type", "getchat");
      formData.append("user_id", userIdParam);
      formData.append("to_chat_id", toChatId); // Should be otherUserId (matched user's ID)

      // Log FormData contents (FormData doesn't serialize well, so we log the values)
      console.log("📋 [Chat] FormData contents:", {
        type: "getchat",
        user_id: userIdParam,
        to_chat_id: toChatId,
      });

      try {
        const response = await apiCall(formData);
        console.log("response for getchat", JSON.stringify(response));
        if (response && response.chat) {
          const fromId = currentUserId;
          console.log("fromId", fromId);
          const formattedMessages = response.chat.map((msg: any) => ({
            id: msg.id,
            text: msg.msg,
            sender: msg.sender_id === fromId ? "user" : "other",
            timestamp: Number(msg.datetime) || Date.now(),
            userId: msg.from_id,
          }));

          // Update last message timestamp
          if (formattedMessages.length > 0) {
            const timestamps = formattedMessages.map(
              (m: Message) => m.timestamp
            );
            lastMessageTimestampRef.current = Math.max(...timestamps);
          }

          // Sort messages chronologically (oldest first, newest last) - don't reverse
          const sortedMessages = formattedMessages.sort(
            (a: Message, b: Message) => a.timestamp - b.timestamp
          );
          setMessages(sortedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to fetch chat history", error);
        setMessages([]);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Check for new messages (checkmsg API)
  const checkNewMessages = useCallback(
    async (toChatId: string, userIdParam: string) => {
      try {
        const formData = new FormData();
        formData.append("type", "checkmsg");
        formData.append("user_id", userIdParam);
        formData.append("to_chat_id", toChatId);

        // Send UTC timestamp from last message (in seconds)
        const lastTimestamp = lastMessageTimestampRef.current || 0;
        // If timestamp is in milliseconds (> 1000000000), convert to seconds
        const utcTimestamp =
          lastTimestamp > 1000000000
            ? Math.floor(lastTimestamp / 1000)
            : lastTimestamp > 0
            ? lastTimestamp
            : Math.floor(Date.now() / 1000);

        formData.append("mysqli_query", utcTimestamp.toString());
        console.log("formData for checkmsg", JSON.stringify(formData));
        const response = await apiCall(formData);
        if (response && response.chat && Array.isArray(response.chat)) {
          if (response.chat.length > 0) {
            const fromId = response.user?.id || userIdParam;
            const newMessages = response.chat.map((msg: any) => ({
              id: msg.id,
              text: msg.msg,
              sender: msg.from_id === fromId ? "user" : "other",
              timestamp: Number(msg.datetime) || Date.now(),
              userId: msg.from_id,
            }));

            // Update last message timestamp
            const timestamps = newMessages.map((m: Message) => m.timestamp);
            lastMessageTimestampRef.current = Math.max(
              lastMessageTimestampRef.current,
              ...timestamps
            );

            // Append new messages to existing messages
            setMessages((prevMessages) => {
              const existingIds = new Set(
                prevMessages.map((m: Message) => m.id)
              );
              const uniqueNewMessages = newMessages.filter(
                (m: Message) => !existingIds.has(m.id)
              );
              if (uniqueNewMessages.length > 0) {
                return [...prevMessages, ...uniqueNewMessages].sort(
                  (a: Message, b: Message) => a.timestamp - b.timestamp
                );
              }
              return prevMessages;
            });
          }
        }
      } catch (error) {
        console.error("Failed to check new messages", error);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      if (!otherUserId || !user?.user_id) return;

      let isFocused = true;

      // Initial fetch - get full chat history
      // Use otherUserId (matched user's ID) as to_chat_id, not matchId (match record ID)
      console.log(
        "🔄 [Chat] useFocusEffect - using otherUserId as to_chat_id:",
        otherUserId
      );
      fetchChatHistory(userData?.id, otherUserId, user.user_id);

      // Set up interval to check for new messages every 10 seconds
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (isFocused && otherUserId && user?.user_id) {
          // Use otherUserId (matched user's ID) as to_chat_id, not matchId (match record ID)
          checkNewMessages(otherUserId, user.user_id);
        }
      }, 10000) as ReturnType<typeof setInterval>;

      return () => {
        isFocused = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otherUserId, user?.user_id])
  );

  const sendMessage = async () => {
    if (!otherUserId || !user?.user_id || inputMessage.trim() === "") return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("type", "sendmsg");
      formData.append("user_id", user.user_id);
      formData.append("to_chat_id", otherUserId); // Use otherUserId (matched user's ID), not matchId (match record ID)
      formData.append("msg", inputMessage.trim());
      formData.append("msg_type", "msg");

      console.log("📤 [Chat] Sending message - FormData contents:", {
        type: "sendmsg",
        user_id: user.user_id,
        to_chat_id: otherUserId, // This should be the matched user's ID (e.g., "1")
        msg: inputMessage.trim(),
        msg_type: "msg",
        matchId, // Match record ID (for reference only)
      });

      const response = await apiCall(formData);
      console.log("✅ [Chat] Send message response:", JSON.stringify(response));

      if (response && response.result) {
        setInputMessage("");
        // showToast(t("chat.messageSent"), "success");

        // Refresh chat history to show the new message
        // Use otherUserId (matched user's ID) as to_chat_id, not matchId (match record ID)
        if (otherUserId && user.user_id) {
          await fetchChatHistory(
            userData?.id,
            otherUserId,
            user.user_id,
            false
          );
        }
      } else {
        const errorMsg = response?.message || t("chat.failedToSend");
        showToast(errorMsg, "error");
        console.error("Failed to send message:", errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error?.message || t("chat.failedToSend");
      showToast(errorMsg, "error");
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "";

    // Handle both seconds and milliseconds
    const date =
      timestamp > 1000000000000
        ? new Date(timestamp)
        : new Date(timestamp * 1000);

    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const timeString = `${displayHours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;

    // Show relative date if not today
    if (messageDate.getTime() === today.getTime()) {
      return timeString;
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return `${t("chat.yesterday")} ${timeString}`;
    } else {
      // Show date for older messages
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      return `${day} ${month} ${timeString}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={userName} />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: Platform.OS === "android" ? keyboardHeight : 0 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <View
                key={message.id}
                style={
                  message.sender === "user"
                    ? styles.userMessageContainer
                    : styles.otherMessageContainer
                }
              >
                <View
                  style={
                    message.sender === "user"
                      ? styles.userMessage
                      : styles.otherMessage
                  }
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === "user" && styles.userMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      message.sender === "user" && styles.userMessageTime,
                    ]}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          ) : !isLoading ? (
            <View style={styles.noMessagesContainer}>
              <Text style={styles.noMessagesText}>
                {t("chat.noMessagesYet")}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Chat input */}
        <View
          style={[
            styles.chatInputWrapper,
            Platform.OS === "android" &&
              keyboardHeight > 0 && {
                position: "absolute",
                bottom: keyboardHeight,
                left: 0,
                right: 0,
              },
          ]}
        >
          <View style={styles.chatInputContainer}>
            <TextInput
              ref={textInputRef}
              style={styles.chatInput}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder={t("chat.typeMessage")}
              multiline
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={inputMessage.trim() === "" || isLoading}
              style={[
                styles.sendButton,
                (inputMessage.trim() === "" || isLoading) &&
                  styles.disabledSendButton,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={color.white} />
              ) : (
                <Text style={styles.sendButtonText}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  otherMessageContainer: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: color.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
  },
  otherMessage: {
    backgroundColor: color.gray94,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
    fontFamily: font.regular,
    marginBottom: 4,
    color: color.black,
  },
  userMessageText: {
    color: color.white,
  },
  messageTime: {
    color: color.gray55,
    fontSize: 11,
    fontFamily: font.regular,
    alignSelf: "flex-end",
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  chatInputWrapper: {
    backgroundColor: color.white,
    borderTopWidth: 1,
    borderTopColor: color.gray94,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.gray94,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: font.regular,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: color.white,
    fontSize: 20,
    fontFamily: font.bold,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noMessagesText: {
    color: color.gray55,
    fontSize: 16,
    fontFamily: font.regular,
  },
});
