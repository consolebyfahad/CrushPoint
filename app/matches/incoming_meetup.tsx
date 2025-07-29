import MeetupCard from '@/components/meetup_card';
import SuggestChanges from '@/components/suggest_changes';
import { color, font } from '@/utils/constants';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IncomingMeetupProps {
  requests: any[];
  searchText: string;
}

export default function IncomingMeetup({ requests, searchText }: IncomingMeetupProps) {
  const [showSuggestChanges, setShowSuggestChanges] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Filter requests based on search text
  const filteredRequests = useMemo(() => {
    if (!searchText.trim()) return requests;
    return requests.filter(request =>
      request.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      request.location.toLowerCase().includes(searchText.toLowerCase()) ||
      request.message.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [requests, searchText]);

  // Action handlers - replace with your API calls
  const handleAccept = useCallback(async (requestId: string) => {
    try {
      console.log('Accepting request:', requestId);
      // Add your API call here
      // const response = await apiCall({...});
      // Update local state or refetch data
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  }, []);

  const handleAcceptChanges = useCallback(async (requestId: string) => {
    try {
      console.log('Accepting changes for request:', requestId);
      // Add your API call here
      // const response = await apiCall({...});
      // Update local state or refetch data
    } catch (error) {
      console.error('Error accepting changes:', error);
    }
  }, []);

  const handleChange = useCallback(async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setShowSuggestChanges(true);
      }
    } catch (error) {
      console.error('Error opening suggest changes:', error);
    }
  }, [requests]);

  const handleSuggestChanges = useCallback(async (changes: any) => {
    try {
      console.log('Submitting suggested changes:', changes);
      // Add your API call here to submit the suggested changes
      // const response = await apiCall({...});
      // Update local state or refetch data
      
      setShowSuggestChanges(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error submitting suggested changes:', error);
    }
  }, []);

  const handleDecline = useCallback(async (requestId: string) => {
    try {
      console.log('Declining request:', requestId);
      // Add your API call here
      // const response = await apiCall({...});
      // Update local state or refetch data
    } catch (error) {
      console.error('Error declining request:', error);
    }
  }, []);

  const renderMeetupCard: ListRenderItem<any> = useCallback(
    ({ item }) => (
      <MeetupCard
        request={item}
        type="incoming"
        onAccept={handleAccept}
        onAcceptChanges={handleAcceptChanges}
        onChange={handleChange}
        onDecline={handleDecline}
      />
    ),
    [handleAccept, handleAcceptChanges, handleChange, handleDecline]
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

  const renderLoadingState = () => (
    <View style={styles.emptyContainer}>
      <ActivityIndicator size="large" color={color.primary} />
      <Text style={styles.loadingText}>Loading requests...</Text>
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
          filteredRequests.length === 0 && { flex: 1 }
        ]}
        ListEmptyComponent={
          searchText.trim() ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                Try searching with different keywords.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              // Add your refresh logic here
              console.log('Refreshing incoming requests...');
            }}
            colors={[color.primary]}
            tintColor={color.primary}
          />
        }
        // Performance optimizations
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
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});