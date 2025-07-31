import MeetupCard from "@/components/meetup_card";
import SuggestChanges from "@/components/suggest_changes";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface IncomingMeetupProps {
  requests: any[];
  searchText: string;
  onUpdateStatus?: (requestId: string, status: string) => void;
  onRemoveRequest?: (requestId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function IncomingMeetup({
  requests,
  searchText,
  onUpdateStatus,
  onRemoveRequest,
  onRefresh,
  isRefreshing = false,
}: IncomingMeetupProps) {
  const { user } = useAppContext();
  const [showSuggestChanges, setShowSuggestChanges] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
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

  // Action handlers with proper API integration
  const handleAccept = useCallback(
    async (requestId: string) => {
      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("type", "update_data");
        formData.append("id", requestId);
        formData.append("table_name", "meetup_requests");
        formData.append("status", "accepted");
        formData.append("user_id", user?.user_id || "");

        const response = await apiCall(formData);

        if (response?.status === "Success") {
          Alert.alert("Success", "Meetup request accepted!");
          onUpdateStatus?.(requestId, "accepted");
        } else {
          Alert.alert("Error", response?.message || "Failed to accept request");
        }
      } catch (error: any) {
        console.error("Error accepting request:", error);
        Alert.alert("Error", "Failed to accept request. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.user_id, onUpdateStatus]
  );

  const handleAcceptChanges = useCallback(
    async (requestId: string) => {
      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("type", "update_data");
        formData.append("id", requestId);
        formData.append("table_name", "meetup_requests");
        formData.append("status", "accepted");
        formData.append("user_id", user?.user_id || "");
        formData.append("accept_changes", "1");

        const response = await apiCall(formData);

        if (response?.status === "Success") {
          Alert.alert("Success", "Changes accepted!");
          onUpdateStatus?.(requestId, "accepted");
        } else {
          Alert.alert("Error", response?.message || "Failed to accept changes");
        }
      } catch (error: any) {
        console.error("Error accepting changes:", error);
        Alert.alert("Error", "Failed to accept changes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.user_id, onUpdateStatus]
  );

  const handleChange = useCallback(
    async (requestId: string) => {
      try {
        const request = requests.find((r) => r.id === requestId);
        if (request) {
          setSelectedRequest(request);
          setShowSuggestChanges(true);
        }
      } catch (error) {
        console.error("Error opening suggest changes:", error);
        Alert.alert("Error", "Failed to open changes dialog");
      }
    },
    [requests]
  );

  const handleSuggestChanges = useCallback(
    async (changes: any) => {
      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("type", "update_data");
        formData.append("id", selectedRequest?.id || "");
        formData.append("table_name", "meetup_requests");
        formData.append("status", "change");
        formData.append("user_id", user?.user_id || "");

        // Add the suggested changes
        if (changes.date) formData.append("suggested_date", changes.date);
        if (changes.time) formData.append("suggested_time", changes.time);
        if (changes.location)
          formData.append("suggested_location", changes.location);
        if (changes.message) formData.append("change_message", changes.message);

        const response = await apiCall(formData);

        if (response?.status === "Success") {
          Alert.alert("Success", "Changes suggested successfully!");
          onUpdateStatus?.(selectedRequest?.id, "change");
          setShowSuggestChanges(false);
          setSelectedRequest(null);
        } else {
          Alert.alert(
            "Error",
            response?.message || "Failed to suggest changes"
          );
        }
      } catch (error: any) {
        console.error("Error submitting suggested changes:", error);
        Alert.alert("Error", "Failed to suggest changes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedRequest, user?.user_id, onUpdateStatus]
  );

  const handleDecline = useCallback(
    async (requestId: string) => {
      Alert.alert(
        "Decline Meetup Request",
        "Are you sure you want to decline this meetup request?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Decline",
            style: "destructive",
            onPress: async () => {
              try {
                setIsLoading(true);

                const formData = new FormData();
                formData.append("type", "update_data");
                formData.append("id", requestId);
                formData.append("table_name", "meetup_requests");
                formData.append("status", "declined");
                formData.append("user_id", user?.user_id || "");

                const response = await apiCall(formData);

                if (response?.status === "Success") {
                  Alert.alert("Success", "Meetup request declined");
                  onRemoveRequest?.(requestId);
                } else {
                  Alert.alert(
                    "Error",
                    response?.message || "Failed to decline request"
                  );
                }
              } catch (error: any) {
                console.error("Error declining request:", error);
                Alert.alert(
                  "Error",
                  "Failed to decline request. Please try again."
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

  const renderMeetupCard: ListRenderItem<any> = useCallback(
    ({ item }) => (
      <MeetupCard
        request={item}
        type="incoming"
        onAccept={handleAccept}
        onAcceptChanges={handleAcceptChanges}
        onChange={handleChange}
        onDecline={handleDecline}
        isLoading={isLoading}
      />
    ),
    [handleAccept, handleAcceptChanges, handleChange, handleDecline, isLoading]
  );

  const keyExtractor = useCallback((item: any) => `incoming-${item.id}`, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📥</Text>
      <Text style={styles.emptyTitle}>No incoming requests</Text>
      <Text style={styles.emptyText}>
        When someone wants to meet you, their requests will appear here.
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

      {/* Suggest Changes Modal */}
      <Modal
        visible={showSuggestChanges}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuggestChanges(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowSuggestChanges(false)}
          />
          {selectedRequest && (
            <SuggestChanges
              onClose={() => {
                setShowSuggestChanges(false);
                setSelectedRequest(null);
              }}
              onSubmit={handleSuggestChanges}
              requestId={selectedRequest.id}
              originalRequest={{
                user: selectedRequest.user,
                timestamp: selectedRequest.timestamp,
                date: selectedRequest.date,
                time: selectedRequest.time,
                location: selectedRequest.location,
              }}
            />
          )}
        </View>
      </Modal>

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
