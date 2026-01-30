import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileOptions({
  visible,
  onClose,
  onBlock,
  onReport,
  onRemoveMatch,
  userData,
  isMatch = false,
  targetUserName,
  targetUserImage,
  targetUserAge,
  targetUserTimeAgo,
}: any) {
  const { t } = useTranslation();
  const handleBlock = () => {
    if (onBlock) onBlock();
  };
  const handleReport = () => {
    if (onReport) onReport();
  };
  const handleRemoveMatch = () => {
    if (onRemoveMatch) onRemoveMatch();
  };
  // When opened from conversation, target* are the other user; otherwise use userData (profile being viewed)
  const fromConversation = targetUserName != null || targetUserImage != null;
  const rawAge = fromConversation
    ? targetUserAge
    : targetUserAge ?? userData?.age;
  const parsedAge =
    rawAge == null
      ? null
      : typeof rawAge === "number"
      ? Number.isNaN(rawAge)
        ? null
        : rawAge
      : typeof rawAge === "string" && rawAge.trim() !== ""
      ? parseInt(rawAge, 10)
      : null;
  const age =
    parsedAge != null && parsedAge >= 0 && parsedAge <= 120
      ? parsedAge
      : fromConversation
      ? 0
      : userData?.age ?? 25;
  const timeAgoFallback = t("common.dayAgo", { count: 1 });
  const displayUser = {
    name: targetUserName ?? userData?.name ?? t("common.defaultUser"),
    age,
    image:
      targetUserImage ??
      userData?.photos?.[0] ??
      userData?.image ??
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    timeAgo: fromConversation
      ? targetUserTimeAgo && String(targetUserTimeAgo).trim() !== ""
        ? targetUserTimeAgo
        : timeAgoFallback
      : userData?.timeAgo ?? timeAgoFallback,
  };
  console.log("age", displayUser.age);
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            {isMatch ? (
              // Show user info for matches (other user when from conversation)
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: displayUser.image }}
                  style={styles.userImage}
                />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {displayUser.name}
                    {displayUser.age > 0 ? `, ${displayUser.age}` : ""}
                  </Text>
                  <Text style={styles.matchInfo}>
                    {t("profile.matched")} {displayUser.timeAgo}
                  </Text>
                </View>
              </View>
            ) : (
              // Show simple title for regular profiles
              <Text style={styles.title}>{t("profile.profileOptions")}</Text>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={color.black} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {/* Remove Match Option - Only show for matches */}
            {isMatch && (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleRemoveMatch}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[styles.iconContainer, styles.removeIconContainer]}
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.optionText}>
                    {t("profile.removeMatch")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Block Option */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleBlock}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, styles.blockIconContainer]}>
                  <Ionicons name="ban" size={20} color="#EF4444" />
                </View>
                <Text style={styles.optionText}>{t("profile.block")}</Text>
              </View>
            </TouchableOpacity>

            {/* Report Option */}
            <TouchableOpacity
              style={[styles.optionItem, styles.lastOptionItem]}
              onPress={handleReport}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View
                  style={[styles.iconContainer, styles.reportIconContainer]}
                >
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.optionText}>{t("profile.report")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
  },
  matchInfo: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  blockIconContainer: {
    backgroundColor: "#FEF2F2",
  },
  removeIconContainer: {
    backgroundColor: "#F9FAFB",
  },
  reportIconContainer: {
    backgroundColor: "#FFFBEB",
  },
  optionText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
});
