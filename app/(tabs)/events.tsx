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
    {
      id: "2",
      title: "Coffee & Chat Morning",
      category: "Social",
      date: "2024-07-18T10:00:00Z",
      location: "Starbucks Downtown, New York",
      description:
        "Start your morning with great coffee and even better conversation! Join fellow coffee enthusiasts for a relaxed morning chat. Whether you're new to the city or looking to expand your social circle, this is the perfect low-key event to meet like-minded people.",
      image:
        "https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=500&h=400&fit=crop",
      organizer: {
        name: "Coffee Lovers NYC",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        verified: false,
      },
      attendees: [
        {
          id: "4",
          name: "Sarah",
          image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "5",
          name: "Mike",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        },
      ],
      totalAttendees: 12,
      isAttending: true,
    },
    {
      id: "3",
      title: "Beach Volleyball Tournament",
      category: "Sports",
      date: "2024-07-20T14:00:00Z",
      location: "Brighton Beach, Brooklyn",
      description:
        "Get ready for some friendly competition on the sand! Our beach volleyball tournament is open to all skill levels. Teams will be formed on the day, so don't worry if you're coming solo. Prizes for winners and fun for everyone!",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop",
      organizer: {
        name: "NYC Sports Club",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        verified: true,
      },
      attendees: [
        {
          id: "6",
          name: "Jake",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "7",
          name: "Lisa",
          image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "8",
          name: "Tom",
          image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "9",
          name: "Anna",
          image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        },
      ],
      totalAttendees: 24,
      isAttending: false,
    },
    {
      id: "4",
      title: "Art Gallery Opening",
      category: "Culture",
      date: "2024-07-22T18:30:00Z",
      location: "Modern Art Museum, Manhattan",
      description:
        "Join us for an exclusive opening of 'Urban Expressions' - a contemporary art exhibition featuring local artists. Enjoy wine, light refreshments, and the opportunity to meet the artists behind these incredible works. Perfect for art enthusiasts and culture lovers!",
      image:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=400&fit=crop",
      organizer: {
        name: "Art Enthusiasts NYC",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        verified: true,
      },
      attendees: [
        {
          id: "10",
          name: "Elena",
          image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "11",
          name: "Marco",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        },
      ],
      totalAttendees: 18,
      isAttending: false,
    },
    {
      id: "5",
      title: "Rooftop Networking Event",
      category: "Business",
      date: "2024-07-25T17:00:00Z",
      location: "Sky Lounge, Midtown Manhattan",
      description:
        "Expand your professional network while enjoying stunning city views! This rooftop networking event brings together professionals from various industries. Great for making new connections, sharing ideas, and building relationships in a relaxed atmosphere.",
      image:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=400&fit=crop",
      organizer: {
        name: "Professional Network NYC",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        verified: true,
      },
      attendees: [
        {
          id: "12",
          name: "David",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "13",
          name: "Rachel",
          image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        },
        {
          id: "14",
          name: "Kevin",
          image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
      ],
      totalAttendees: 35,
      isAttending: true,
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
    console.log("Event pressed:", event.title);
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
