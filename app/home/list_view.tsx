import UserCard from "@/components/user_card";
import useGetUsers from "@/hooks/useGetUsers";
import { color } from "@/utils/constants";
import React from "react";
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

export default function ListView({ onViewProfile, onBookmark }: any) {
  const { users, loading, error, refetch } = useGetUsers();

  const renderUserCard = ({ item }: any) => (
    <UserCard
      user={item}
      onViewProfile={onViewProfile}
      onBookmark={onBookmark}
    />
  );

  // Main content with users
  return (
    <SafeAreaView style={styles.container}>
      {error && users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>😔 Oops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : loading && users.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={[color.primary]}
              tintColor={color.primary}
              title="Pull to refresh"
              titleColor="#666"
            />
          }
          // Optional: Show error message at top if there are users but also an error
          ListHeaderComponent={
            error && users.length > 0 ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {error}</Text>
                <TouchableOpacity onPress={refetch}>
                  <Text style={styles.retryLink}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginBottom: 24,
  },
  listContainer: {
    paddingVertical: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorBanner: {
    backgroundColor: "#FFF3CD",
    borderColor: "#FFEAA7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorBannerText: {
    color: "#856404",
    fontSize: 14,
    flex: 1,
  },
  retryLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
