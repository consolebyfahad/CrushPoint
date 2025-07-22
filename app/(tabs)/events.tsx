import CustomSearchBar from "@/components/custom_search";
import EventCard from "@/components/event_card";
import EventsTabsHeader from "@/components/tabs_header";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Events({ navigation }: any) {
  const [searchText, setSearchText] = useState("");
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Summer Meetup Party",
      category: "Social",
      date: "2024-07-15T19:00:00Z",
      location: "Central Park, New York",
      description:
        "Join us for a fun evening of music, games, and meeting new people! We'll have live music, outdoor games, and food trucks. This is a great opportunity to make new friends and enjoy a beautiful summer evening in the park.",
      image:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop",
      organizer: {
        name: "City Social Club",
        image:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
        verified: true,
      },
      attendees: [
        {
          id: "1",
          name: "Alex",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "2",
          name: "Emma",
          image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "3",
          name: "David",
          image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
      ],
      totalAttendees: 45,
      isAttending: false,
    },
  ]);

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

  const handleToggleAttending = (event: any) => {
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id
          ? {
              ...e,
              isAttending: !e.isAttending,
              totalAttendees: e.isAttending
                ? e.totalAttendees - 1
                : e.totalAttendees + 1,
            }
          : e
      )
    );
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
      <Text style={styles.emptyTitle}>No events found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search or check back later for new events
      </Text>
    </View>
  );

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
});
