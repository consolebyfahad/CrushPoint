import InviteMatches from "@/components/invite";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EventDetails({ route, navigation }: any) {
  const event = route?.params?.event || {
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
    totalAttendees: 3,
    isAttending: false,
  };

  const [isAttending, setIsAttending] = useState(event.isAttending);
  const [showInviteMatches, setShowInviteMatches] = useState(false);

  const handleBack = () => {
    // if (navigation) {
    //   navigation.goBack();
    // } else {
    //   console.log("Go back");
    // }
  };

  const handleShare = () => {
    console.log("Share event");
    // Handle share functionality
  };

  const handleGetDirections = () => {
    console.log("Get directions to:", event.location);
    // Open maps app with location
  };

  const handleAddToCalendar = () => {
    console.log("Add to calendar:", event.title);
    // Add event to device calendar
  };

  const handleInviteMatches = () => {
    setShowInviteMatches(true);
  };

  const handleSendInvites = (selectedMatches: any) => {
    console.log("Sending invites to:", selectedMatches);
    // Handle sending invites logic here
    // You could show a success message or navigate somewhere
  };

  const handleRSVP = () => {
    setIsAttending(!isAttending);
    console.log(isAttending ? "Left event" : "Joined event");
    // Handle RSVP logic
  };

  const handleViewAllAttendees = () => {
    console.log("View all attendees");
    // Navigate to attendees list
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />

        {/* Header Overlay */}
        <SafeAreaView style={styles.headerOverlay}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color={color.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={24} color={color.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title and Category */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={color.gray400} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>{formatDate(event.date)}</Text>
              <Text style={styles.infoSubtext}>{formatTime(event.date)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={color.gray400} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>{event.location}</Text>
              <TouchableOpacity onPress={handleGetDirections}>
                <Text style={styles.directionsText}>Get directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Organizer */}
        <View style={styles.infoSection}>
          <View style={styles.organizerRow}>
            <Image
              source={{ uri: event.organizer.image }}
              style={styles.organizerImage}
            />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerLabel}>Organized by</Text>
              <View style={styles.organizerNameRow}>
                <Text style={styles.organizerName}>{event.organizer.name}</Text>
                {event.organizer.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#10B981"
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Who's Going Section */}
        <View style={styles.section}>
          <View style={styles.attendeesHeader}>
            <Text style={styles.sectionTitle}>Who's going</Text>
            <View style={styles.attendeesCount}>
              <Ionicons name="people-outline" size={16} color={color.gray400} />
              <Text style={styles.attendeesCountText}>
                {event.totalAttendees} attending
              </Text>
            </View>
          </View>

          <View style={styles.attendeesRow}>
            <View style={styles.attendeesList}>
              {event.attendees.map((attendee: any, index: number) => (
                <Image
                  key={attendee.id}
                  source={{ uri: attendee.image }}
                  style={[
                    styles.attendeeImage,
                    { marginLeft: index > 0 ? -8 : 0 },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity onPress={handleViewAllAttendees}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAddToCalendar}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color={color.black} />
            <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleInviteMatches}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={18} color={color.black} />
            <Text style={styles.secondaryButtonText}>Invite Matches</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* RSVP Button */}
      <View style={styles.rsvpContainer}>
        <TouchableOpacity
          style={[styles.rsvpButton, isAttending && styles.rsvpButtonActive]}
          onPress={handleRSVP}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={color.white}
            style={styles.rsvpIcon}
          />
          <Text style={styles.rsvpButtonText}>
            {isAttending ? "Going" : "RSVP Now"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invite Matches Modal */}
      <InviteMatches
        visible={showInviteMatches}
        onClose={() => setShowInviteMatches(false)}
        onSendInvites={handleSendInvites}
        eventTitle={event.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.35,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  titleSection: {
    padding: 20,
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: 24,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: font.medium,
    color: "#0284C7",
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  infoSubtext: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray600,
    marginTop: 2,
  },
  directionsText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#5FB3D4",
    marginTop: 4,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray400,
    marginBottom: 2,
  },
  organizerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerName: {
    fontSize: 14,
    fontFamily: font.semiBold,
    color: color.black,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray600,
    lineHeight: 20,
  },
  attendeesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  attendeesCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeesCountText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray400,
    marginLeft: 4,
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attendeesList: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: color.white,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: "#5FB3D4",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: color.white,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
    marginLeft: 6,
  },
  bottomSpacing: {
    height: 100,
  },
  rsvpContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  rsvpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5FB3D4",
    paddingVertical: 16,
    borderRadius: 12,
  },
  rsvpButtonActive: {
    backgroundColor: "#10B981",
  },
  rsvpIcon: {
    marginRight: 8,
  },
  rsvpButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
