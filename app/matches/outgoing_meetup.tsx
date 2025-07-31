import MeetupCard from "@/components/meetup_card";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface OutgoingMeetupProps {
  requests: any[];
  searchText: string;
  onUpdateStatus?: (requestId: string, status: string) => void;
  onRemoveRequest?: (requestId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function OutgoingMeetup({
  requests,
  searchText,
  onUpdateStatus,
  onRemoveRequest,
  onRefresh,
  isRefreshing = false,
}: OutgoingMeetupProps) {
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // Filter requests based on search text
  const filteredRequests = useMemo(() => {
    if (!searchText.trim()) return requests;
    return requests.filter(
      (request) =>
        request.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        request.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        request.message?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [requests, searchText]);

  // Handle canceling outgoing request
  const handleCancel = useCallback(
    async (requestId: string) => {
      Alert.alert(
        "Cancel Request",
        "Are you sure you want to cancel this meetup request?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                setIsLoading(true);

                const formData = new FormData();
                formData.append("type", "update_data");
                formData.append("id", requestId);
                formData.append("table_name", "meetup_requests");
                formData.append("status", "cancelled");
                formData.append("user_id", user?.user_id || "");

                const response = await apiCall(formData);

                if (response?.status === "Success") {
                  Alert.alert("Success", "Request cancelled successfully");
                  onRemoveRequest?.(requestId);
                } else {
                  Alert.alert(
                    "Error",
                    response?.message || "Failed to cancel request"
                  );
                }
              } catch (error: any) {
                console.error("Error cancelling request:", error);
                Alert.alert(
                  "Error",
                  "Failed to cancel request. Please try again."
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    },
    [user?.user_id, onRemoveRequest]
  );

  // Handle editing/updating outgoing request (if pending)
  const handleEdit = useCallback(async (requestId: string) => {
    try {
      console.log("Editing request:", requestId);
      Alert.alert(
        "Feature Coming Soon",
        "Request editing will be available soon!"
      );
    } catch (error) {
      console.error("Error editing request:", error);
    }
  }, []);

  const renderMeetupCard: ListRenderItem<any> = useCallback(
    ({ item }) => (
      <MeetupCard
        request={item}
        type="outgoing"
        onCancel={item.status === "pending" ? handleCancel : undefined}
        onEdit={item.status === "pending" ? handleEdit : undefined}
        isLoading={isLoading}
      />
    ),
    [handleCancel, handleEdit, isLoading]
  );

  const keyExtractor = useCallback((item: any) => `outgoing-${item.id}`, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📤</Text>
      <Text style={styles.emptyTitle}>No outgoing requests</Text>
      <Text style={styles.emptyText}>
        Meetup requests you send to others will appear here.
      </Text>
    </View>
  );

  const renderSearchEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptyText}>
        Try searching with different keywords.
      </Text>
    </View>
  );

  if (requests.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRequests}
        renderItem={renderMeetupCard}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredRequests.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={searchText.trim() ? renderSearchEmptyState() : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
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

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={color.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
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
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: color.white,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: color.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
  },
});
