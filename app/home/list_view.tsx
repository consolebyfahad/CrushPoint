import UserCard from "@/components/user_card";
import { color, font } from "@/utils/constants";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ListViewProps {
  onViewProfile: (user: any) => void;
  onShowUserOnMap: (user: any) => void; // UPDATED: More descriptive prop name
  users: any[];
  loading: boolean;
  error: string | null;
  refetch?: any;
}

interface User {
  id: string;
  name: string;
  age: number;
  // Add other user properties as needed
}

export default function ListView({
  onViewProfile,
  onShowUserOnMap, // UPDATED: Updated prop name
  users,
  loading,
  error,
  refetch,
}: ListViewProps) {
  // Memoized render function for better performance
  const renderUserCard: ListRenderItem<User> = useCallback(
    ({ item }) => (
      <UserCard
        user={item}
        onViewProfile={onViewProfile}
        onShowUserOnMap={onShowUserOnMap}
      />
    ),
    [onViewProfile, onShowUserOnMap] // UPDATED: Updated dependency
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: User) => `user-${item.id}`, []);

  // Handle retry with better UX
  const handleRetry = useCallback(() => {
    if (!loading) {
      refetch();
    }
  }, [loading, refetch]);

  // Render error state when no users and there's an error
  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorEmoji}>😔</Text>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>
        {error || "Unable to load users. Please try again."}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, loading && styles.retryButtonDisabled]}
        onPress={handleRetry}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={color.white} />
        ) : (
          <Text style={styles.retryButtonText}>Try Again</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={color.primary} />
      <Text style={styles.loadingText}>Finding users near you...</Text>
    </View>
  );

  // Render empty state when no error but no users
  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>No users found</Text>
      <Text style={styles.emptyMessage}>
        Try adjusting your search radius or check back later for new users in
        your area.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error banner for when there are users but also an error
  const renderErrorBanner = () => {
    if (!error || users.length === 0) return null;

    return (
      <View style={styles.errorBanner}>
        <View style={styles.errorBannerContent}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
          <TouchableOpacity
            onPress={handleRetry}
            disabled={loading}
            style={styles.errorBannerButton}
          >
            <Text
              style={[styles.retryLink, loading && styles.retryLinkDisabled]}
            >
              {loading ? "Loading..." : "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Main render logic
  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (error && users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>{renderErrorState()}</SafeAreaView>
    );
  }

  if (!loading && !error && users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>{renderEmptyState()}</SafeAreaView>
    );
  }

  // Main content with users list
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderErrorBanner}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[color.primary]}
            tintColor={color.primary}
            title="Pull to refresh"
            titleColor={color.gray55}
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={3}
        windowSize={10}
        // Better handling of empty list
        ListEmptyComponent={renderEmptyState}
        // Add some spacing at the bottom
        ListFooterComponent={<View style={styles.listFooter} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listContainer: {
    paddingTop: 60,
    flexGrow: 1,
  },
  listFooter: {
    height: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
  },
  // Error states
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  // Empty states
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  // Buttons
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
  // Error banner
  errorBanner: {
    backgroundColor: "#FFF3CD",
    borderColor: "#FFEAA7",
    borderWidth: 1,
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
  },
  errorBannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  errorBannerText: {
    color: "#856404",
    fontSize: 14,
    fontFamily: font.medium,
    flex: 1,
    marginRight: 12,
  },
  errorBannerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryLink: {
    color: color.primary,
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  retryLinkDisabled: {
    opacity: 0.6,
  },
});
