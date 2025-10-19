import Header from "@/components/header";
import useGetBlockedUsers from "@/hooks/useGetBlockedUsers";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BlockedUsers({ navigation }: any) {
  const { t } = useTranslation();
  const { blockedUsers, loading, unblockUser } = useGetBlockedUsers();
  const handleUnblock = (user: any) => {
    Alert.alert(
      t("blockedUsers.unblock.title"),
      t("blockedUsers.unblock.message", { name: user.name }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("blockedUsers.unblock.button"),
          style: "default",
          onPress: async () => {
            const success = await unblockUser(user.id, user.block_id);

            if (success) {
              Alert.alert(
                t("blockedUsers.unblock.success.title"),
                t("blockedUsers.unblock.success.message", { name: user.name }),
                [{ text: t("common.ok") }]
              );
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }: any) => (
    <View style={styles.userItem}>
      <View style={styles.userContent}>
        <Image source={{ uri: item.image }} style={styles.userImage} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.name}, {item.age}
          </Text>
          <Text style={styles.blockedDate}>
            {t("blockedUsers.blockedDate", { date: item.blockedDate })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.unblockText}>
          {t("blockedUsers.unblock.button")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="ban-outline" size={64} color={color.error} />
      </View>
      <Text style={styles.emptyTitle}>{t("blockedUsers.empty.title")}</Text>
      <Text style={styles.emptyText}>
        {t("blockedUsers.empty.description")}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={color.primary} />
      <Text style={styles.loadingText}>{t("blockedUsers.loading")}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("blockedUsers.title")} divider={true} />

      {/* Content */}
      {loading ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderBlockedUser}
          keyExtractor={(item) => item.id}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  userContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 4,
  },
  blockedDate: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  unblockText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: color.error100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
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
    color: color.gray14,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    marginTop: 16,
  },
});
