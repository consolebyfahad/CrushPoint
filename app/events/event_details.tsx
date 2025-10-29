import CustomButton from "@/components/custom_button";
import InviteMatches from "@/components/invite";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import {
  AddCalender,
  Calender,
  ExternalLinkIcon,
  Users,
} from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import * as Calendar from "expo-calendar";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Attendees Modal Component
interface AttendeesModalProps {
  visible: boolean;
  onClose: () => void;
  attendees: any[];
  eventTitle: string;
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  visible,
  onClose,
  attendees,
  eventTitle,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>
            {t("events.whosGoing")} - {eventTitle}
          </Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <Ionicons name="close" size={24} color={color.gray14} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={modalStyles.content}
          showsVerticalScrollIndicator={false}
        >
          {attendees.length === 0 ? (
            <View style={modalStyles.emptyState}>
              <Text style={modalStyles.emptyText}>
                {t("events.noAttendeesYet")}
              </Text>
            </View>
          ) : (
            attendees.map((attendee, index) => (
              <View key={attendee.id || index} style={modalStyles.attendeeItem}>
                <Image
                  source={{ uri: attendee.image }}
                  style={modalStyles.attendeeImage}
                />
                <Text style={modalStyles.attendeeName}>{attendee.name}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default function EventDetails() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  console.log("params", params);
  const [event, setEvent] = useState<any>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [showInviteMatches, setShowInviteMatches] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const { user } = useAppContext();
  const { showToast } = useToast();
  const [isRSVPing, setIsRSVPing] = useState(false);
  useEffect(() => {
    if (params.event) {
      try {
        const eventData = JSON.parse(params.event as string);
        setEvent(eventData);
        // Set attending status based on user_going field
        setIsAttending(
          eventData.user_going === "1" || eventData.user_going === 1
        );
      } catch (error) {
        console.error("Error parsing event data:", error);
        router.back();
      }
    } else {
      console.error("No event data provided");
      router.back();
    }
  }, [params.event]);

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("events.loadingEvent")}</Text>
      </View>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        title: event.title,
        message: `${event.title}\n\n📅 ${event.date} at ${event.time}\n📍 ${
          event.address
        }\n\n${event.description}\n\nOrganized by: ${
          event.organizer?.name || "Unknown"
        }\n\nJoin me at this event!`,
        url: event.image, // Include event image if available
      };

      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        showToast(t("events.eventShared"), "success");
      } else if (result.action === Share.dismissedAction) {
        // User dismissed the share sheet
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing event:", error);
      showToast(t("events.failedToShare"), "error");
    }
  };

  const handleGetDirections = async () => {
    try {
      const address = event.address || event.location;

      if (!address) {
        showToast(t("events.noLocationAvailable"), "error");
        return;
      }

      // Create the maps URL based on platform
      let mapsUrl: string;

      if (Platform.OS === "ios") {
        // Use Apple Maps for iOS
        mapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(address)}`;
      } else {
        // Use Google Maps for Android
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address
        )}`;
      }

      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(mapsUrl);

      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback to generic maps URL
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address
        )}`;
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      console.error("Error opening maps:", error);
      showToast(t("events.failedToOpenMaps"), "error");
    }
  };

  const handleAddToCalendar = async () => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          t("events.calendarPermissionDenied"),
          t("events.calendarPermissionMessage"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("common.settings"),
              onPress: () => {
                // Open device settings
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }

      // Get writable calendars
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );

      console.log(
        "Available calendars:",
        calendars.map((cal) => ({
          id: cal.id,
          title: cal.title,
          allowsModifications: cal.allowsModifications,
          source: cal.source?.name,
          isLocalAccount: cal.source?.isLocalAccount,
        }))
      );

      // Find a writable calendar (not read-only)
      const writableCalendar =
        calendars.find(
          (cal) => cal.allowsModifications && !cal.source?.isLocalAccount
        ) || calendars.find((cal) => cal.allowsModifications);

      if (!writableCalendar) {
        showToast(t("events.noWritableCalendarFound"), "error");
        return;
      }

      // Parse event date and time
      const eventDate = new Date(event.date);
      const startDate = new Date(eventDate);
      const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

      // Create calendar event
      const eventDetails = {
        title: event.title,
        startDate: startDate,
        endDate: endDate,
        allDay: false,
        location: event.location || event.address,
        notes: `${event.description}\n\nOrganized by: ${
          event.organizer?.name || "Unknown"
        }\n\nEvent from Andra Dating App`,
        alarms: [
          {
            relativeOffset: -60, // 1 hour before
          },
          {
            relativeOffset: -1440, // 1 day before
          },
        ],
        calendarId: writableCalendar.id,
      };

      // Create the event
      const eventId = await Calendar.createEventAsync(
        writableCalendar.id,
        eventDetails
      );

      if (eventId) {
        showToast(t("events.addedToCalendar"), "success");
      } else {
        showToast(t("events.failedToAddToCalendar"), "error");
      }
    } catch (error) {
      console.error("Calendar error:", error);
      showToast(t("events.calendarError"), "error");
    }
  };

  const handleInviteMatches = () => {
    setShowInviteMatches(true);
  };

  const handleSendInvites = (selectedMatches: any) => {
    // Handle sending invites logic here
    // You could show a success message or navigate somewhere
  };

  const handleOrganizerWebsite = async () => {
    if (event?.organizer?.website) {
      try {
        const url = event.organizer.website.startsWith("http")
          ? event.organizer.website
          : `https://${event.organizer.website}`;

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          showToast(t("events.websiteNotAvailable"), "error");
        }
      } catch (error) {
        console.error("Error opening website:", error);
        showToast(t("events.websiteError"), "error");
      }
    } else {
      showToast(t("events.noWebsiteAvailable"), "info");
    }
  };

  const handleRSVP = async () => {
    if (!user?.user_id) {
      showToast(t("events.userSessionExpired"), "error");
      return;
    }

    setIsRSVPing(true);

    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("user_id", user.user_id);
      formData.append("table_name", "event_rsvp");
      formData.append("event_id", event.id.toString());
      console.log("formData", formData);
      const response = await apiCall(formData);
      console.log("response for RSVP", response);

      if (response.result) {
        setIsAttending(!isAttending);
      } else {
        showToast(response.message || t("events.failedToRSVP"), "error");
      }
    } catch (error) {
      showToast(t("events.somethingWentWrongTryAgain"), "error");
    } finally {
      setIsRSVPing(false);
    }
  };

  const handleViewAllAttendees = () => {
    setShowAttendeesModal(true);
  };

  // Parse going users data
  const parseGoingUsers = () => {
    if (!event?.going || !Array.isArray(event.going)) {
      console.log("No going data found:", event?.going);
      return [];
    }

    console.log("Parsing going users:", event.going);
    const parsedUsers = event.going.map((user: any) => {
      // Check if user already has a complete image URL
      let imageUrl = user.image;

      // If no direct image URL, try to parse from images array
      if (!imageUrl && user.images) {
        try {
          const images = JSON.parse(user.images.replace(/\\"/g, '"'));
          if (images.length > 0) {
            imageUrl = `https://api.andra-dating.com/images/${images[0]}`;
          }
        } catch (error) {
          console.error("Error parsing user images:", error);
        }
      }

      // Fallback to default image if no image found
      if (!imageUrl) {
        imageUrl =
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face";
      }

      const result = {
        id: user.id || user.name, // Use ID if available, otherwise name
        name: user.name,
        image: imageUrl,
      };
      console.log("Parsed user:", result);
      return result;
    });

    console.log("Final parsed users:", parsedUsers);
    return parsedUsers;
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
              <Feather name="share-2" size={24} color={color.white} />
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
            <Ionicons name="calendar-outline" size={20} color={color.gray14} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>{event.date}</Text>
              <Text style={styles.infoSubtext}>{event.time}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={color.gray14} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>{event.address}</Text>
              <TouchableOpacity onPress={handleGetDirections}>
                <Text style={styles.directionsText}>
                  {t("events.getDirections")}
                </Text>
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
              <View>
                <Text style={styles.organizerLabel}>
                  {t("events.organizedBy")}
                </Text>
                <View style={styles.organizerNameRow}>
                  <Text style={styles.organizerName}>
                    {event.organizer.name}
                  </Text>
                  {event.organizer.verified && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#10B981"
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>
              </View>
              {!event.organizer.website && (
                <TouchableOpacity
                  style={styles.websiteButton}
                  onPress={handleOrganizerWebsite}
                  activeOpacity={0.8}
                >
                  <Text style={styles.websiteText}>{t("events.website")}</Text>
                  <ExternalLinkIcon />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("events.aboutThisEvent")}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Who's Going Section */}
        <View style={styles.section}>
          <View style={styles.attendeesHeader}>
            <Text style={styles.sectionTitle}>{t("events.whosGoing")}</Text>
            <View style={styles.attendeesCount}>
              <Feather name="users" size={16} color={color.gray55} />
              <Text style={styles.attendeesCountText}>
                {event.going_count || 0} {t("events.attending")}
              </Text>
            </View>
          </View>

          <View style={styles.attendeesRow}>
            <View style={styles.attendeesList}>
              {parseGoingUsers()
                .slice(0, 5)
                .map((attendee: any, index: number) => (
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
              <Text style={styles.viewAllText}>{t("events.viewAll")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title={t("events.addToCalendar")}
            variant="secondary"
            style={{ width: "48%" }}
            icon={<AddCalender />}
            onPress={handleAddToCalendar}
          />
          <CustomButton
            title={t("events.inviteMatches")}
            variant="secondary"
            style={{
              width: "48%",
              alignItems: "center",
              justifyContent: "center",
            }}
            icon={<Users />}
            onPress={handleInviteMatches}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* RSVP Button */}
      <View style={styles.rsvpContainer}>
        <CustomButton
          title={
            isRSVPing
              ? t("events.processing")
              : isAttending
              ? t("events.going")
              : t("events.rsvpNow")
          }
          icon={<Calender />}
          onPress={handleRSVP}
          isDisabled={isRSVPing || isAttending}
          isLoading={isRSVPing}
        />
      </View>

      {/* Invite Matches Modal */}
      <InviteMatches
        visible={showInviteMatches}
        onClose={() => setShowInviteMatches(false)}
        onSendInvites={handleSendInvites}
        eventTitle={event.title}
        eventId={event.id}
      />

      {/* Attendees Modal */}
      <AttendeesModal
        visible={showAttendeesModal}
        onClose={() => setShowAttendeesModal(false)}
        attendees={parseGoingUsers()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.white,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
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
    backgroundColor: color.primary100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: font.medium,
    color: color.primary,
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
    color: color.gray55,
  },
  infoSubtext: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginTop: 2,
  },
  directionsText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
    marginTop: 4,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  organizerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  organizerLabel: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray55,
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
  websiteButton: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  websiteIcon: {
    marginLeft: 6,
  },
  websiteText: {
    fontSize: 14,
    fontFamily: font.semiBold,
    color: color.black,
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
    color: color.gray55,
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
    color: color.gray55,
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
    color: color.primary,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    paddingTop: 8,
    paddingBottom: 34,
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

// Modal Styles
const modalStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: color.white,
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
  },
  attendeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  attendeeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  attendeeName: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
});
