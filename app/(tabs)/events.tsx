import CustomSearchBar from "@/components/custom_search";
import EventCard from "@/components/event_card";
import EventsTabsHeader from "@/components/tabs_header";
import useGetEvents from "@/hooks/useGetEvents";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventsTab() {
  const [searchText, setSearchText] = useState("");
  const { loading, events, error, refetch, toggleAttendance } = useGetEvents();

  // Filter events based on search text
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchText.toLowerCase()) ||
      event.location.toLowerCase().includes(searchText.toLowerCase()) ||
      event.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEventPress = (event: any) => {
    router.push({
      pathname: "/events/event_details",
      params: { event: JSON.stringify(event) },
    });
  };

  const handleToggleAttending = async (event: any) => {
    await toggleAttendance(event.id);
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderEventCard = ({ item }: any) => (
    <EventCard
      event={item}
      onPress={handleEventPress}
      onToggleAttending={handleToggleAttending}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calendar-outline" size={64} color={color.gray14} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchText ? "No events found" : "No events available"}
      </Text>
      <Text style={styles.emptyText}>
        {searchText
          ? "Try adjusting your search terms"
          : "Check back later for new events"}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <ScrollView
      contentContainerStyle={styles.errorContainer}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.emptyIconContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={color.error} />
      </View>
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <Text style={styles.retryText}>Pull down to retry</Text>
    </ScrollView>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={color.primary} />
      <Text style={styles.loadingText}>Loading events...</Text>
    </View>
  );

  // Show loading state on initial load
  if (loading && events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EventsTabsHeader title="Upcoming Events" events={[]} />
        <CustomSearchBar
          searchText={searchText}
          onChangeText={setSearchText}
          placeholder="Search events"
        />
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  // Show error state if there's an error and no events
  if (error && events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EventsTabsHeader title="Upcoming Events" events={[]} />
        <CustomSearchBar
          searchText={searchText}
          onChangeText={setSearchText}
          placeholder="Search events"
        />
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <EventsTabsHeader title="Upcoming Events" events={events} />

      {/* Search Bar */}
      <CustomSearchBar
        searchText={searchText}
        onChangeText={setSearchText}
        placeholder="Search events"
      />

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[color.primary]}
            tintColor={color.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    minHeight: 400,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    minHeight: 200,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
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
  loadingText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray14,
    marginTop: 12,
    textAlign: "center",
  },
  retryText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});
