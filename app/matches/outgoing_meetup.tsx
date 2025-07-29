import MeetupCard from '@/components/meetup_card';
import { color, font } from '@/utils/constants';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, RefreshControl, StyleSheet, Text, View } from 'react-native';

interface OutgoingMeetupProps {
  requests: any[];
  searchText: string;
}

export default function OutgoingMeetup({ requests, searchText }: OutgoingMeetupProps) {
  // Filter requests based on search text
  const filteredRequests = useMemo(() => {
    if (!searchText.trim()) return requests;
    return requests.filter(request =>
      request.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      request.location.toLowerCase().includes(searchText.toLowerCase()) ||
      request.message.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [requests, searchText]);

  const renderMeetupCard: ListRenderItem<any> = useCallback(
    ({ item }) => (
      <MeetupCard
        request={item}
        type="outgoing"
      />
    ),
    []
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
              console.log('Refreshing outgoing requests...');
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
});