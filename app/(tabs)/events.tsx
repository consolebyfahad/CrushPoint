import EventCard from "@/components/event_card";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Events({ navigation }: any) {
  const [searchText, setSearchText] = useState("");

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Summer Meetup Party",
      date: "2024-07-15T18:00:00Z",
      location: "Central Park, New York",
      description:
        "Join us for a fun evening of music, games, and meeting new people!",
      image:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=300&fit=crop",
      attendees: 45,
      isAttending: false,
    },
    {
      id: "2",
      title: "Beach Volleyball Tournament",
      date: "2024-07-20T14:00:00Z",
      location: "Brighton Beach, Brooklyn",
      description:
        "Get active and meet new friends at our beach volleyball event.",
      image:
        "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=500&h=300&fit=crop",
      attendees: 32,
      isAttending: true,
    },
    {
      id: "3",
      title: "Coffee & Chat Morning",
      date: "2024-07-22T10:00:00Z",
      location: "Blue Bottle Coffee, Manhattan",
      description:
        "Start your day with great coffee and meaningful conversations.",
      image:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500&h=300&fit=crop",
      attendees: 18,
      isAttending: false,
    },
    {
      id: "4",
      title: "Rooftop Sunset Social",
      date: "2024-07-25T19:00:00Z",
      location: "230 Fifth, Manhattan",
      description:
        "Watch the sunset over NYC while mingling with fellow singles.",
      image:
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&h=300&fit=crop",
      attendees: 67,
      isAttending: false,
    },
    {
      id: "5",
      title: "Art Gallery Night",
      date: "2024-07-28T20:00:00Z",
      location: "Museum of Modern Art, NYC",
      description: "Explore contemporary art and connect with creative minds.",
      image:
        "https://images.unsplash.com/photo-1544967882-612d1917e7ee?w=500&h=300&fit=crop",
      attendees: 29,
      isAttending: true,
    },
  ]);

  // Filter events based on search text
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchText.toLowerCase()) ||
      event.location.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEventPress = (event: any) => {
    console.log("Event pressed:", event.title);
    router.push("/events/event_details");
  };

  const handleToggleAttending = (event: any) => {
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id
          ? {
              ...e,
              isAttending: !e.isAttending,
              attendees: e.isAttending ? e.attendees - 1 : e.attendees + 1,
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
        <Ionicons name="calendar-outline" size={64} color={color.gray400} />
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
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Upcoming Events</Text>
          <Text style={styles.eventCount}>{events.length} Events</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={color.gray400}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search events"
            placeholderTextColor={color.gray400}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={color.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: color.white,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontFamily: font.bold,
    color: color.black,
  },
  eventCount: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray400,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: color.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  clearButton: {
    marginLeft: 8,
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
    color: color.gray400,
    textAlign: "center",
    lineHeight: 24,
  },
});
