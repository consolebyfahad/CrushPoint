import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
  const [blockedUsers, setBlockedUsers] = useState([
    {
      id: "1",
      name: "Alex",
      age: 25,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      blockedDate: "7 days ago",
    },
    {
      id: "2",
      name: "Sam",
      age: 28,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      blockedDate: "2 days ago",
    },
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleUnblock = (user: any) => {
    Alert.alert(
      "Unblock User",
      `Are you sure you want to unblock ${user.name}? They will be able to see your profile and interact with you again.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unblock",
          style: "default",
          onPress: () => {
            // Remove user from blocked list
            setBlockedUsers((prevUsers) =>
              prevUsers.filter((blockedUser) => blockedUser.id !== user.id)
            );

            console.log(`Unblocked user: ${user.name}`);

            // Show success message
            Alert.alert(
              "User Unblocked",
              `${user.name} has been unblocked successfully.`,
              [{ text: "OK" }]
            );
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
          <Text style={styles.blockedDate}>Blocked {item.blockedDate}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="ban-outline" size={64} color={color.error} />
      </View>
      <Text style={styles.emptyTitle}>No blocked users</Text>
      <Text style={styles.emptyText}>
        Users you block will appear here. You can unblock them anytime.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={"Blocked Users"} divider={true} />

      {/* Content */}
      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.id}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
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
});
