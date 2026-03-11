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
import * as ExpoLinking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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

const APP_STORE_URL = "https://apps.apple.com/app/andra-dating/id000000000";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.dating.Andra";

interface AttendeesModalProps {
  visible: boolean;
  onClose: () => void;
  attendees: any[];
  eventTitle: string;
  onAttendeePress?: (attendee: any) => void;
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  visible,
  onClose,
  attendees,
  eventTitle,
  onAttendeePress,
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
              <TouchableOpacity
                key={attendee.id || index}
                style={modalStyles.attendeeItem}
                onPress={() => {
                  onAttendeePress?.(attendee);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: attendee.image }}
                  style={modalStyles.attendeeImage}
                />
                <Text style={modalStyles.attendeeName}>{attendee.name}</Text>
              </TouchableOpacity>
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
  const [event, setEvent] = useState<any>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [showInviteMatches, setShowInviteMatches] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const { user, userData } = useAppContext();
  const { showToast } = useToast();
  const [isRSVPing, setIsRSVPing] = useState(false);
  const [inviteRecordId, setInviteRecordId] = useState<string | null>(null);
  const [isRespondingToInvite, setIsRespondingToInvite] = useState(false);
  const [inviteResponded, setInviteResponded] = useState(false);

  const fetchEventInviteForUser = React.useCallback(
    async (eventId: string) => {
      if (!user?.user_id) return null;
      try {
        const formData = new FormData();
        formData.append("type", "get_data");
        formData.append("table_name", "event_invites");
        formData.append("event_id", eventId);
        formData.append("invited_id", user.user_id);
        const response = await apiCall(formData);
        console.log("fetchEventInviteForUser response", response);
        const list = response?.data;
        if (Array.isArray(list) && list.length > 0) {
          const pending = list.find(
            (r: any) =>
              !r.status ||
              r.status === "pending" ||
              r.status === "0" ||
              String(r.status).toLowerCase() === "pending",
          );
          const record = pending || list[0];
          return record?.id ? String(record.id) : null;
        }
        return null;
      } catch {
        return null;
      }
    },
    [user?.user_id],
  );

  const fetchEventById = React.useCallback(
    async (eventId: string) => {
      try {
        const formData = new FormData();
        formData.append("type", "get_data");
        formData.append("table_name", "events");
        formData.append("id", eventId);
        const response = await apiCall(formData);
        if (
          response?.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const raw = response.data[0];
          const imageUrl = raw.image?.startsWith("http")
            ? raw.image
            : raw.image
              ? `https://api.andra-dating.com/images/${raw.image}`
              : "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop";

          const defaultAvatar =
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face";
          const going = Array.isArray(raw.going)
            ? raw.going.map((u: any) => {
                let img = u.image;
                if (!img && u.images) {
                  try {
                    const arr = JSON.parse(
                      String(u.images).replace(/\\"/g, '"'),
                    );
                    if (Array.isArray(arr) && arr.length > 0) {
                      img = `https://api.andra-dating.com/images/${arr[0]}`;
                    }
                  } catch (_) {}
                }
                return {
                  id: u.id || u.name,
                  name: u.name || "Unknown",
                  image: img || defaultAvatar,
                };
              })
            : [];
          const fromApiUserGoing =
            raw.user_going === "1" || raw.user_going === 1;
          const currentUserId = userData?.id ?? user?.user_id;
          const isUserInGoing =
            currentUserId != null &&
            Array.isArray(going) &&
            going.some((u: any) => String(u.id) === String(currentUserId));
          const isAttendingValue = fromApiUserGoing || isUserInGoing;
          const eventData = {
            id: raw.id,
            title: raw.title || raw.title_languages,
            category: raw.category || "",
            date: raw.date,
            time: raw.time,
            to_time: raw.to_time,
            location: raw.address || raw.location || "",
            address: raw.address || raw.location || "",
            description: raw.detail || raw.description || raw.details || "",
            image: imageUrl,
            organizer: {
              name: raw.organized_by || raw.org_by_languages || "Unknown",
              image: raw.organizer_image?.startsWith("http")
                ? raw.organizer_image
                : raw.organizer_image
                  ? `https://api.andra-dating.com/images/${raw.organizer_image}`
                  : "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
              verified: raw.organizer_verified === "1" || false,
            },
            going,
            going_count: raw.going_count ?? going.length,
            isAttending: isAttendingValue,
            user_going: raw.user_going || (isAttendingValue ? "1" : "0"),
            web_link: raw.web_link,
            lat: raw.lat,
            lng: raw.lng,
            distance: raw.distance,
            attendees: going,
            totalAttendees: raw.going_count ?? going.length,
          };
          setEvent(eventData);
          setIsAttending(isAttendingValue);
          return true;
        }
      } catch (error) {
        return false;
      }
      return false;
    },
    [userData?.id, user?.user_id],
  );

  useEffect(() => {
    const inviteIdParam =
      typeof params.inviteId === "string" ? params.inviteId : null;
    if (inviteIdParam) setInviteRecordId(inviteIdParam);

    if (params.event) {
      try {
        const eventData = JSON.parse(params.event as string);
        setEvent(eventData);
        setIsAttending(
          eventData.user_going === "1" || eventData.user_going === 1,
        );
        if (!inviteIdParam && eventData.id && user?.user_id) {
          fetchEventInviteForUser(String(eventData.id)).then((id) => {
            if (id) setInviteRecordId(id);
          });
        }
      } catch (error) {
        router.back();
      }
    } else if (params.eventId && typeof params.eventId === "string") {
      fetchEventById(params.eventId).then((ok) => {
        if (!ok) router.back();
        else if (!inviteIdParam && user?.user_id) {
          fetchEventInviteForUser(params.eventId as string).then((id) => {
            if (id) setInviteRecordId(id);
          });
        }
      });
    } else {
      router.back();
    }
  }, [
    params.event,
    params.eventId,
    params.inviteId,
    fetchEventById,
    fetchEventInviteForUser,
    user?.user_id,
  ]);

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
      // Deep link: use expo-linking so URL format matches Expo Router (path = events/event_details, query = eventId).
      // app.json must have "scheme": "andra". Test: npx uri-scheme open "andra:///events/event_details?eventId=12" --ios
      const appDeepLink = ExpoLinking.createURL("events/event_details", {
        queryParams: { eventId: String(event.id) },
        isTripleSlashed: true,
      });
      const storeUrl = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
      const storeLinks = t("events.getAppFromStore", { url: storeUrl });

      // Full text for the share; deep link in message so it's visible
      const message = `${event.title}\n\n📅 ${event.date} at ${event.time}${
        event.to_time ? ` - ${event.to_time}` : ""
      }\n📍 ${event.address}\n\n${event.description}\n\nOrganized by: ${
        event.organizer?.name || "Unknown"
      }\n\n${t("events.joinMeAtEvent")}\n\n${t(
        "events.openEventInApp",
      )}: ${appDeepLink}\n\n${storeLinks}`;

      const shareOptions: { title: string; message: string; url?: string } = {
        title: event.title,
        message,
      };
      if (Platform.OS === "android") {
        shareOptions.url = appDeepLink;
      }
      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        showToast(t("events.eventShared"), "success");
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      showToast(t("events.failedToShare"), "error");
    }
  };

  const handleGetDirections = async () => {
    try {
      if (event.lat && event.lng) {
        const lat = String(event.lat).trim();
        const lng = String(event.lng).trim();
        let mapsUrl: string;

        if (Platform.OS === "ios") {
          mapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;
        } else {
          mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        }

        const canOpen = await Linking.canOpenURL(mapsUrl);
        if (canOpen) {
          await Linking.openURL(mapsUrl);
          return;
        }
      }

      const address = event.address || event.location;
      if (!address) {
        showToast(t("events.noLocationAvailable"), "error");
        return;
      }

      if (Platform.OS === "ios") {
        const mapsUrl = `http://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
        const canOpen = await Linking.canOpenURL(mapsUrl);
        if (canOpen) {
          await Linking.openURL(mapsUrl);
        } else {
          await Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
          );
        }
      } else {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        await Linking.openURL(mapsUrl);
      }
    } catch (error) {
      showToast(t("events.failedToOpenMaps"), "error");
    }
  };

  const handleAddToCalendar = async () => {
    try {
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
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT,
      );

      const writableCalendar =
        calendars.find(
          (cal) => cal.allowsModifications && !cal.source?.isLocalAccount,
        ) || calendars.find((cal) => cal.allowsModifications);

      if (!writableCalendar) {
        showToast(t("events.noWritableCalendarFound"), "error");
        return;
      }

      let startDate: Date;
      let endDate: Date;

      try {
        let eventDate: Date;
        if (typeof event.date === "string") {
          const dateStr = event.date.trim();

          const ddMmYyyyMatch = dateStr.match(/^\d{2}-\d{2}-\d{4}$/);

          if (ddMmYyyyMatch) {
            const [day, month, year] = dateStr.split("-").map(Number);
            eventDate = new Date(year, month - 1, day);
          } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateStr.split("-").map(Number);
            eventDate = new Date(year, month - 1, day);
          } else if (dateStr.match(/^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$/)) {
            const monthMap: { [key: string]: number } = {
              Jan: 0,
              Feb: 1,
              Mar: 2,
              Apr: 3,
              May: 4,
              Jun: 5,
              Jul: 6,
              Aug: 7,
              Sep: 8,
              Oct: 9,
              Nov: 10,
              Dec: 11,
            };

            const parts = dateStr.split(" ");
            if (parts.length >= 3) {
              const month = monthMap[parts[0]];
              const day = parseInt(parts[1].replace(",", ""));
              const year = parseInt(parts[2]);
              eventDate = new Date(year, month, day);
            } else {
              throw new Error("Invalid date format");
            }
          } else {
            eventDate = new Date(dateStr);
            if (isNaN(eventDate.getTime())) {
              throw new Error(`Invalid date format: ${dateStr}`);
            }
          }
        } else {
          eventDate = new Date(event.date);
        }

        if (isNaN(eventDate.getTime())) {
          throw new Error(`Failed to parse date: ${event.date}`);
        }

        const parsedYear = eventDate.getFullYear();

        if (parsedYear < 2000 || parsedYear > 2100) {
          showToast(
            t("events.invalidDateCheck", { date: event.date }),
            "error",
          );
          throw new Error(
            `Invalid year in date: ${parsedYear}. Original: ${event.date}`,
          );
        }

        startDate = new Date(eventDate);

        if (event.time) {
          const timeStr = event.time.trim();

          if (timeStr.includes("AM") || timeStr.includes("PM")) {
            const timeParts = timeStr.split(" ");
            const timeValue = timeParts[0];
            const ampm = timeParts[1]?.toUpperCase();
            const [hours, minutes] = timeValue.split(":").map(Number);

            let hour24 = hours;
            if (ampm === "PM" && hours !== 12) {
              hour24 += 12;
            } else if (ampm === "AM" && hours === 12) {
              hour24 = 0;
            }

            startDate.setHours(hour24, minutes || 0, 0, 0);
          } else {
            const [hours, minutes] = timeStr.split(":").map(Number);
            startDate.setHours(hours || 0, minutes || 0, 0, 0);
          }
        } else {
          startDate.setHours(12, 0, 0, 0);
        }

        if (event.to_time) {
          const toTimeStr = event.to_time.trim();

          if (toTimeStr.includes("AM") || toTimeStr.includes("PM")) {
            const timeParts = toTimeStr.split(" ");
            const timeValue = timeParts[0];
            const ampm = timeParts[1]?.toUpperCase();
            const [hours, minutes] = timeValue.split(":").map(Number);

            let hour24 = hours;
            if (ampm === "PM" && hours !== 12) {
              hour24 += 12;
            } else if (ampm === "AM" && hours === 12) {
              hour24 = 0;
            }

            endDate = new Date(eventDate);
            endDate.setHours(hour24, minutes || 0, 0, 0);
          } else {
            const [hours, minutes] = toTimeStr.split(":").map(Number);
            endDate = new Date(eventDate);
            endDate.setHours(hours || 0, minutes || 0, 0, 0);
          }

          if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
          }
        } else {
          endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        }
      } catch (error) {
        showToast(
          t("events.invalidDateTimeFormat") || "Invalid date/time format",
          "error",
        );
        return;
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        showToast(
          t("events.invalidDateTimeFormat") || "Invalid date/time format",
          "error",
        );
        return;
      }

      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      if (
        startYear < 2000 ||
        startYear > 2100 ||
        endYear < 2000 ||
        endYear > 2100
      ) {
        showToast(t("events.invalidYearRange", { year: startYear }), "error");
        return;
      }

      if (endDate <= startDate) {
        showToast(
          t("events.invalidDateTimeFormat") || "Invalid date/time format",
          "error",
        );
        return;
      }

      const eventDetails = {
        title: event.title,
        startDate: startDate,
        endDate: endDate,
        allDay: false,
        location: event.location || event.address || "",
        notes: `${event.description || ""}\n\nOrganized by: ${
          event.organizer?.name || "Unknown"
        }\n\nEvent from Andra Dating App`,
        alarms: [
          {
            relativeOffset: -60,
          },
          {
            relativeOffset: -1440,
          },
        ],
        calendarId: writableCalendar.id,
      };

      const finalStartYear = startDate.getFullYear();
      const finalEndYear = endDate.getFullYear();

      if (finalStartYear < 2000 || finalStartYear > 2100) {
        showToast(
          t("events.cannotAddEventContactSupport", { year: finalStartYear }),
          "error",
        );
        return;
      }

      if (finalEndYear < 2000 || finalEndYear > 2100) {
        showToast(
          t("events.cannotAddEventContactSupport", { year: finalEndYear }),
          "error",
        );
        return;
      }

      const eventId = await Calendar.createEventAsync(
        writableCalendar.id,
        eventDetails,
      );

      if (eventId) {
        showToast(t("events.addedToCalendar"), "success");
      } else {
        showToast(t("events.failedToAddToCalendar"), "error");
      }
    } catch (error) {
      showToast(t("events.calendarError"), "error");
    }
  };

  const handleInviteMatches = () => {
    setShowInviteMatches(true);
  };

  const handleSendInvites = (selectedMatches: any) => {};

  const handleOrganizerWebsite = async () => {
    if (event?.web_link) {
      try {
        const url = event.web_link.startsWith("http")
          ? event.web_link
          : `https://${event.web_link}`;

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          showToast(t("events.websiteNotAvailable"), "error");
        }
      } catch (error) {
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
      console.log("handleRSVP formData", formData);
      const response = await apiCall(formData);
      console.log("handleRSVP response", response);
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

  const updateEventInviteStatus = async (status: "accepted" | "rejected") => {
    if (!event?.id || !user?.user_id) return;
    setIsRespondingToInvite(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("table_name", "event_invites");
      formData.append("id", String(event.id));
      formData.append("status", status);
      console.log("updateEventInviteStatus formData", formData);
      const response = await apiCall(formData);
      console.log("updateEventInviteStatus response", response);
      if (response?.result) {
        setInviteResponded(true);
        setInviteRecordId(null);
        if (status === "accepted") {
          showToast(t("events.inviteAccepted"), "success");
          setIsAttending(true);
        } else {
          showToast(t("events.inviteRejected"), "info");
        }
      } else {
        showToast(
          response?.message || t("events.somethingWentWrongTryAgain"),
          "error",
        );
      }
    } catch (error) {
      showToast(t("events.somethingWentWrongTryAgain"), "error");
    } finally {
      setIsRespondingToInvite(false);
    }
  };

  const handleAcceptInvite = () => updateEventInviteStatus("accepted");
  const handleRejectInvite = () => updateEventInviteStatus("rejected");

  const handleViewAllAttendees = () => {
    setShowAttendeesModal(true);
  };

  const handleOpenAttendeeProfile = (attendee: any) => {
    if (
      attendee?.id != null &&
      userData?.id != null &&
      String(attendee.id) === String(userData.id)
    ) {
      return;
    }
    const profileUserData = {
      id: attendee.id,
      name: attendee.name,
      image: attendee.image,
      images: attendee.image ? [attendee.image] : [],
    };
    router.push({
      pathname: "/profile/user_profile",
      params: {
        user: JSON.stringify(profileUserData),
        userId: String(attendee.id),
      },
    });
  };

  const parseGoingUsers = () => {
    if (!event?.going || !Array.isArray(event.going)) {
      return [];
    }

    const parsedUsers = event.going.map((user: any) => {
      let imageUrl = user.image;

      if (!imageUrl && user.images) {
        try {
          const images = JSON.parse(user.images.replace(/\\"/g, '"'));
          if (images.length > 0) {
            imageUrl = `https://api.andra-dating.com/images/${images[0]}`;
          }
        } catch (error) {}
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

      return result;
    });

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
              <Text style={styles.infoSubtext}>
                {event.time}
                {event.to_time ? ` - ${event.to_time}` : ""}
              </Text>
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
              source={{
                uri: event.organizer.image,
              }}
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
              {event.web_link && (
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
                  <TouchableOpacity
                    key={attendee.id}
                    onPress={() => handleOpenAttendeeProfile(attendee)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: attendee.image }}
                      style={[
                        styles.attendeeImage,
                        { marginLeft: index > 0 ? -8 : 0 },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity onPress={handleViewAllAttendees}>
              <Text style={styles.viewAllText}>{t("events.viewAll")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {console.log("isAttending", isAttending)}
        {inviteRecordId && !inviteResponded && !isAttending && (
          <View style={styles.inviteResponseSection}>
            <Text style={styles.inviteResponseTitle}>
              {t("events.youAreInvited")}
            </Text>
            {isRespondingToInvite && (
              <View style={styles.inviteResponseLoading}>
                <ActivityIndicator size="small" color={color.primary} />
                <Text style={styles.inviteResponseLoadingText}>
                  {t("events.processing")}
                </Text>
              </View>
            )}
            <View style={styles.inviteResponseButtons}>
              <TouchableOpacity
                style={[styles.inviteResponseButton, styles.rejectButton]}
                onPress={handleRejectInvite}
                disabled={isRespondingToInvite}
                activeOpacity={0.8}
              >
                <Text style={styles.inviteResponseButtonText}>
                  {t("events.rejectInvite")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inviteResponseButton, styles.acceptButton]}
                onPress={handleAcceptInvite}
                disabled={isRespondingToInvite}
                activeOpacity={0.8}
              >
                <Text style={styles.inviteResponseButtonText}>
                  {t("events.acceptInvite")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.rsvpContainer}>
        {inviteRecordId && !inviteResponded && !isAttending ? null : (
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
        )}
      </View>

      <InviteMatches
        visible={showInviteMatches}
        onClose={() => setShowInviteMatches(false)}
        onSendInvites={handleSendInvites}
        eventTitle={event.title}
        eventId={event.id}
      />

      <AttendeesModal
        visible={showAttendeesModal}
        onClose={() => setShowAttendeesModal(false)}
        attendees={parseGoingUsers()}
        eventTitle={event.title}
        onAttendeePress={handleOpenAttendeeProfile}
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
  inviteResponseSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: color.primary100,
    borderRadius: 16,
  },
  inviteResponseTitle: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 12,
    textAlign: "center",
  },
  inviteResponseLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  inviteResponseLoadingText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  inviteResponseButtons: {
    flexDirection: "row",
    gap: 12,
  },
  inviteResponseButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  rejectButton: {
    backgroundColor: color.gray55,
  },
  acceptButton: {
    backgroundColor: color.primary,
  },
  inviteResponseButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
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
