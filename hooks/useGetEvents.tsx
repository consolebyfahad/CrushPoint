import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { formatTimeAgo } from "@/utils/helper";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface EventAttendee {
  id: string;
  name: string;
  image: string;
}

interface EventOrganizer {
  name: string;
  image: string;
  verified: boolean;
}

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  address: string;
  description: string;
  image: string;
  organizer: EventOrganizer;
  attendees: EventAttendee[];
  totalAttendees: number;
  isAttending: boolean;
  timeAgo?: string;
}

const IMAGE_BASE_URL = "https://7tracking.com/crushpoint/images/";

const useGetEvents = () => {
  const { user } = useAppContext();
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get default event image
  const getDefaultEventImage = (): string => {
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop";
  };

  // Parse event image
  const parseEventImage = (imageStr: string): string => {
    if (!imageStr) {
      return getDefaultEventImage();
    }

    try {
      // If it's already a full URL, return as is
      if (imageStr.startsWith("http")) {
        return imageStr;
      }

      // Otherwise, construct URL with base path
      return `${IMAGE_BASE_URL}${imageStr}`;
    } catch (error) {
      console.warn("Error parsing event image:", error);
      return getDefaultEventImage();
    }
  };

  // Parse attendees from string/JSON
  const parseAttendees = (attendeesStr: string): EventAttendee[] => {
    if (!attendeesStr) return [];

    try {
      const parsed = JSON.parse(attendeesStr);
      if (Array.isArray(parsed)) {
        return parsed.map((attendee: any) => ({
          id: attendee.id || attendee.user_id || Math.random().toString(),
          name: attendee.name || `User ${attendee.id}`,
          image:
            attendee.image ||
            attendee.profile_image ||
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        }));
      }
      return [];
    } catch (error) {
      console.warn("Error parsing attendees:", error);
      return [];
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "events");

      const response = await apiCall(formData);

      if (Array.isArray(response?.data)) {
        const formattedEvents = response.data.map((event: any) => {
          const attendees = parseAttendees(event.attendees || "[]");

          return {
            id: event.id || Math.random().toString(),
            title: event.title || t("events.defaultTitle"),
            category: event.category || t("events.defaultCategory"),
            date: event.date || new Date().toISOString(),
            time: event.time,
            location:
              event.location || event.venue || t("events.defaultLocation"),
            address:
              event.address || event.location || t("events.defaultLocation"),
            description:
              event.description ||
              event.details ||
              t("events.defaultDescription"),
            image: parseEventImage(event.image || event.event_image),
            organizer: {
              name: event.organized_by || t("events.defaultOrganizer"),
              image:
                event.organizer_image ||
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
              verified:
                event.organizer_verified === "1" ||
                event.verified === "1" ||
                false,
            },
            attendees: attendees.slice(0, 3), // Show only first 3 attendees
            totalAttendees:
              parseInt(event.total_attendees) || attendees.length || 0,
            isAttending:
              event.is_attending === "1" ||
              event.user_attending === "1" ||
              false,
            timeAgo: formatTimeAgo(
              event.created_date || event.date,
              event.created_time || "00:00:00"
            ),
          };
        });

        setEvents(formattedEvents);

        if (formattedEvents.length === 0) {
          setError(t("events.noEventsFound"));
        }
      } else if (response?.status === "Error") {
        setError(response.message || t("events.failedToLoadEvents"));
      } else {
        setEvents([]);
        setError(t("events.noEventsFound"));
      }
    } catch (error: any) {
      const errorMessage = error.message || t("events.networkError");
      setError(errorMessage);
      console.error("Fetch events error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle event attendance
  const toggleAttendance = async (eventId: string) => {
    if (!user?.user_id) {
      setError(t("events.userNotLoggedIn"));
      return;
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Optimistically update UI
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === eventId
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

    try {
      const formData = new FormData();
      formData.append("type", event.isAttending ? "leave_event" : "join_event");
      formData.append("event_id", eventId);
      formData.append("user_id", user.user_id);

      const response = await apiCall(formData);

      if (response?.status === "Error") {
        // Revert optimistic update on error
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  isAttending: event.isAttending,
                  totalAttendees: event.totalAttendees,
                }
              : e
          )
        );
        setError(response.message || t("events.failedToUpdateAttendance"));
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === eventId
            ? {
                ...e,
                isAttending: event.isAttending,
                totalAttendees: event.totalAttendees,
              }
            : e
        )
      );
      console.error("Toggle attendance error:", error);
      setError(t("events.failedToUpdateAttendance"));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    events,
    error,
    refetch: loadData,
    toggleAttendance,
  };
};

export default useGetEvents;
