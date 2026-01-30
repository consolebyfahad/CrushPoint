import BlockConfirmation from "@/components/block_option";
import Header from "@/components/header";
import ProfileOptions from "@/components/profile_options";
import ReportUser from "@/components/report_user";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import useGetInterests from "@/hooks/useGetInterests";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { parseInterestsWithNames } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
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
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams();
  const match_status = params.match_status as string;
  const match_emoji = params.match_emoji as string;
  const { user, userData } = useAppContext();
  const { rawInterests: apiInterests } = useGetInterests();

  const { showToast } = useToast();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const matchId = params.matchId as string; // Match record ID (from matches table)
  const otherUserId = params.userId as string; // Matched user's ID (should be used as to_chat_id)
  const userName = params.userName as string;
  const userImage = params.userImage as string;
  const userAge =
    params.userAge != null && params.userAge !== ""
      ? (typeof params.userAge === "string"
          ? parseInt(params.userAge, 10)
          : Number(params.userAge))
      : undefined;
  const userAgeValid =
    userAge != null && !Number.isNaN(userAge) && userAge >= 0 && userAge <= 120;
  const userTimeAgo = (params.userTimeAgo as string) ?? undefined;

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
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);
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
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
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
      showLoading = true,
    ) => {
      if (showLoading) {
        setIsLoading(true);
      }
      const formData = new FormData();
      formData.append("type", "getchat");
      formData.append("user_id", userIdParam);
      formData.append("to_chat_id", toChatId); // Should be otherUserId (matched user's ID)

      // Log FormData contents (FormData doesn't serialize well, so we log the values)

      try {
        const response = await apiCall(formData);
        if (response && response.chat) {
          const fromId = currentUserId;

          const formattedMessages = response.chat.map((msg: any) => ({
            id: msg.id || `${msg.timestamp || msg.datetime}_${msg.sender_id}`,
            text: msg.msg,
            sender: msg.sender_id === fromId ? "user" : "other",
            timestamp: Number(msg.timestamp || msg.datetime) || Date.now(),
            userId: msg.sender_id,
          }));

          // Update last message timestamp
          if (formattedMessages.length > 0) {
            const timestamps = formattedMessages.map(
              (m: Message) => m.timestamp,
            );
            lastMessageTimestampRef.current = Math.max(...timestamps);
          }

          // Sort messages chronologically (oldest first, newest last) - don't reverse
          const sortedMessages = formattedMessages.sort(
            (a: Message, b: Message) => a.timestamp - b.timestamp,
          );
          setMessages(sortedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        setMessages([]);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  // Check for new messages (checkmsg API)
  const checkNewMessages = useCallback(
    async (toChatId: string, userIdParam: string) => {
      try {
        const formData = new FormData();
        formData.append("type", "checkmsg");
        formData.append("user_id", userIdParam);
        formData.append("to_chat_id", toChatId);

        const response = await apiCall(formData);
        if (response && response.chat && Array.isArray(response.chat)) {
          if (response.chat.length > 0) {
            const currentUserId = userData?.id || userIdParam;
            const newMessages = response.chat.map((msg: any) => ({
              id: msg.id || `${msg.timestamp}_${msg.sender_id}`,
              text: msg.msg,
              sender: msg.sender_id === currentUserId ? "user" : "other",
              timestamp: Number(msg.timestamp) || Date.now(),
              userId: msg.sender_id,
            }));

            // Update last message timestamp
            const timestamps = newMessages.map((m: Message) => m.timestamp);
            lastMessageTimestampRef.current = Math.max(
              lastMessageTimestampRef.current,
              ...timestamps,
            );

            // Append new messages to existing messages
            setMessages((prevMessages) => {
              const existingIds = new Set(
                prevMessages.map((m: Message) => m.id),
              );
              const uniqueNewMessages = newMessages.filter(
                (m: Message) => !existingIds.has(m.id),
              );
              if (uniqueNewMessages.length > 0) {
                return [...prevMessages, ...uniqueNewMessages].sort(
                  (a: Message, b: Message) => a.timestamp - b.timestamp,
                );
              }
              return prevMessages;
            });
          }
        }
      } catch (error) {}
    },
    [userData?.id],
  );

  useFocusEffect(
    useCallback(() => {
      if (!otherUserId || !user?.user_id) return;

      let isFocused = true;

      // Initial fetch - get full chat history
      // Use otherUserId (matched user's ID) as to_chat_id, not matchId (match record ID)

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
    }, [otherUserId, user?.user_id]),
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

      const response = await apiCall(formData);

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
            false,
          );
        }
      } else {
        const errorMsg = response?.message || t("chat.failedToSend");
        showToast(errorMsg, "error");
      }
    } catch (error: any) {
      const errorMsg = error?.message || t("chat.failedToSend");
      showToast(errorMsg, "error");
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
      date.getDate(),
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

  const handleBack = () => {
    router.push({
      pathname: "/(tabs)/matches",
    });
  };

  const handleViewProfile = useCallback(async () => {
    if (!otherUserId || !user?.user_id) {
      return;
    }

    try {
      // Fetch user profile data
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "users");
      formData.append("id", otherUserId);

      const response = await apiCall(formData);
      console.log("response", response);
      if (response?.data && response.data.length > 0) {
        const userProfileData = response.data[0];

        // Parse images
        let images: string[] = [];
        if (userProfileData.images) {
          try {
            const cleanedImagesString = userProfileData.images
              .replace(/\\\\/g, "\\")
              .replace(/\\\"/g, '"');
            const imageFilenames = JSON.parse(cleanedImagesString);
            const baseImageUrl =
              userProfileData.image_url ||
              "https://api.andra-dating.com/images/";

            if (Array.isArray(imageFilenames) && imageFilenames.length > 0) {
              images = imageFilenames.map((filename: string) => {
                const cleanFilename = filename.replace(/\\/g, "");
                return `${baseImageUrl}${cleanFilename}`;
              });
            }
          } catch (error) {
            // Error parsing images
          }
        }

        // Calculate age
        const calculateAge = (dob: string) => {
          if (!dob) return 0;
          try {
            const birthDate = new Date(dob);
            if (isNaN(birthDate.getTime())) return 0;
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

        const age = calculateAge(userProfileData.dob);

        // Parse interests and convert IDs to names
        let parsedInterests: string[] = [];
        if (userProfileData.interests) {
          try {
            const currentLanguage = i18n.language || "en";
            // Use parseInterestsWithNames to convert IDs to names
            if (typeof userProfileData.interests === "string") {
              parsedInterests = parseInterestsWithNames(
                userProfileData.interests,
                apiInterests,
                currentLanguage,
              );
            } else if (Array.isArray(userProfileData.interests)) {
              // If already an array, check if they're IDs or names
              // If first element is a number or numeric string, they're IDs
              const firstItem = userProfileData.interests[0];
              const areIds = firstItem && /^\d+$/.test(String(firstItem));
              if (areIds && apiInterests && apiInterests.length > 0) {
                // Convert IDs to names
                parsedInterests = parseInterestsWithNames(
                  JSON.stringify(userProfileData.interests),
                  apiInterests,
                  currentLanguage,
                );
              } else {
                // Already names, use as is
                parsedInterests = userProfileData.interests;
              }
            }
          } catch (error) {
            // If parsing fails, keep as empty array
            parsedInterests = [];
          }
        }

        // Parse looking_for if it's a string
        let parsedLookingFor: string[] = [];
        if (userProfileData.looking_for) {
          try {
            if (typeof userProfileData.looking_for === "string") {
              const cleaned = userProfileData.looking_for
                .replace(/\\\\/g, "\\")
                .replace(/\\\"/g, '"');
              parsedLookingFor = JSON.parse(cleaned);
            } else if (Array.isArray(userProfileData.looking_for)) {
              parsedLookingFor = userProfileData.looking_for;
            }
          } catch (error) {
            // If parsing fails, keep as empty array
            parsedLookingFor = [];
          }
        }

        // Parse languages if it's a string
        let parsedLanguages: string[] = [];
        if (userProfileData.languages) {
          try {
            if (typeof userProfileData.languages === "string") {
              // Languages might be comma-separated or JSON
              if (userProfileData.languages.startsWith("[")) {
                const cleaned = userProfileData.languages
                  .replace(/\\\\/g, "\\")
                  .replace(/\\\"/g, '"');
                parsedLanguages = JSON.parse(cleaned);
              } else {
                parsedLanguages = userProfileData.languages
                  .split(",")
                  .map((l: string) => l.trim())
                  .filter(Boolean);
              }
            } else if (Array.isArray(userProfileData.languages)) {
              parsedLanguages = userProfileData.languages;
            }
          } catch (error) {
            // If parsing fails, try as comma-separated string
            if (typeof userProfileData.languages === "string") {
              parsedLanguages = userProfileData.languages
                .split(",")
                .map((l: string) => l.trim())
                .filter(Boolean);
            }
          }
        }

        // Prepare user profile data for navigation - matching structure from matches.tsx
        const profileData = {
          id: userProfileData.id || otherUserId,
          name: userProfileData.name || userName,
          age: age,
          images: images,
          about: userProfileData.about || "",
          height: userProfileData.height || "",
          nationality: userProfileData.nationality || "",
          religion: userProfileData.religion || "",
          zodiac: userProfileData.zodiac || "",
          gender: userProfileData.gender || "",
          country: userProfileData.country || "",
          match_status: params.match_status || "",
          match_emoji: params.match_emoji || "",
          state: userProfileData.state || "",
          city: userProfileData.city || "",
          languages: parsedLanguages,
          interests: parsedInterests,
          lookingFor: parsedLookingFor,
          isOnline: userProfileData.status === "1",
          phone: userProfileData.phone || "",
          dob: userProfileData.dob || "",
          actualLocation:
            userProfileData.lat && userProfileData.lng
              ? {
                  lat: parseFloat(userProfileData.lat),
                  lng: parseFloat(userProfileData.lng),
                }
              : null,
          email: userProfileData.email || "",
        };
        console.log("profileData", profileData);
        return;
      }
    } catch (error) {
      showToast(t("chat.errorLoading") || "Failed to load profile", "error");
    }
  }, [otherUserId, user?.user_id, userName, showToast, t]);

  const handleOptions = () => setShowProfileOptions(true);
  const handleBlock = () => {
    setShowProfileOptions(false);
    setShowBlockConfirmation(true);
  };
  const handleConfirmBlock = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "blocked_users");
      formData.append("block_id", otherUserId);
      formData.append("user_id", user?.user_id || "");
      const response = await apiCall(formData);
      if (response?.result) {
        setShowBlockConfirmation(false);
        showToast(t("profile.userBlocked") || "User blocked", "success");
        router.back();
      }
    } catch (error) {
      showToast(t("chat.errorLoading") || "Failed to block", "error");
    }
  };
  const handleReport = () => {
    setShowProfileOptions(false);
    setShowReportUser(true);
  };
  const handleSubmitReport = async (reportData: {
    reason: string;
    additionalDetails: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "reported_users");
      formData.append("block_id", otherUserId);
      formData.append("additional_details", reportData.additionalDetails);
      formData.append("reason", reportData.reason);
      formData.append("user_id", user?.user_id || "");
      const response = await apiCall(formData);
      if (response?.result) {
        setShowReportUser(false);
        showToast(t("report.reportSubmitted") || "Report submitted", "success");
      }
    } catch (error) {
      showToast(t("chat.errorLoading") || "Failed to report", "error");
    }
  };
  const handleBackToProfileOptions = () => {
    setShowBlockConfirmation(false);
    setShowReportUser(false);
    setShowProfileOptions(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={userName}
        onPress={handleBack}
        userImage={userImage}
        onImagePress={handleViewProfile}
        rightElement={
          <TouchableOpacity
            style={styles.headerOptionsButton}
            onPress={handleOptions}
            activeOpacity={0.8}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={color.gray14} />
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 2 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          contentContainerStyle={[
            styles.scrollViewContent,
            // { paddingBottom: Platform.OS === "android" ? keyboardHeight + 80 : 10 },
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
        <View style={styles.chatInputWrapper}>
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

      <ProfileOptions
        visible={showProfileOptions}
        onClose={() => setShowProfileOptions(false)}
        onBlock={handleBlock}
        onReport={handleReport}
        onRemoveMatch={() => setShowProfileOptions(false)}
        userData={userData}
        isMatch={true}
        targetUserName={userName}
        targetUserImage={userImage}
        targetUserAge={userAgeValid ? userAge : undefined}
        targetUserTimeAgo={userTimeAgo}
      />
      <BlockConfirmation
        visible={showBlockConfirmation}
        onClose={() => setShowBlockConfirmation(false)}
        onBack={handleBackToProfileOptions}
        onConfirm={handleConfirmBlock}
        userName={userName}
      />
      <ReportUser
        visible={showReportUser}
        onClose={() => setShowReportUser(false)}
        onBack={handleBackToProfileOptions}
        onSubmit={handleSubmitReport}
        userName={userName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  headerOptionsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
