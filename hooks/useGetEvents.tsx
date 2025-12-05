import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { formatTimeAgo } from "@/utils/helper";
import { useCallback, useEffect, useState } from "react";
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
  time: string;
  location: string;
  address: string;
  description: string;
  image: string;
  organizer: EventOrganizer;
  attendees: EventAttendee[];
  totalAttendees: number;
  isAttending: boolean;
  timeAgo?: string;
  // New fields from API
  going: EventAttendee[];
  going_count: number;
  user_going: string;
}

const IMAGE_BASE_URL = "https://api.andra-dating.com/images/";

const useGetEvents = () => {
  const { user } = useAppContext();
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper function to get localized value from *_languages field
  const getLocalizedValue = (
    event: any,
    fieldName: string,
    fallbackValue: string
  ): string => {
    const languagesField = `${fieldName}_languages`;
    const languagesValue = event[languagesField];

    if (!languagesValue) {
      return fallbackValue || event[fieldName] || "";
    }

    try {
      // Parse the JSON string from *_languages field
      const languages =
        typeof languagesValue === "string"
          ? JSON.parse(languagesValue)
          : languagesValue;

      // Get current language (defaults to "en" if not found)
      const currentLang = i18n.language || "en";
      const langCode = currentLang.split("-")[0]; // Get "en" from "en-US"

      // Try to get the value for current language, fallback to "en", then to original value
      return (
        languages[langCode] ||
        languages["en"] ||
        event[fieldName] ||
        fallbackValue ||
        ""
      );
    } catch (error) {
      console.warn(`Error parsing ${languagesField}:`, error);
      return event[fieldName] || fallbackValue || "";
    }
  };

  // Get default event image
  const getDefaultEventImage = (): string => {
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop";
  };

  // Parse event image
  const parseEventImage = (imageStr: string): string => {
    console.log("Parsing event image:", imageStr);
    if (!imageStr) {
      console.log("No image string, using default");
      return getDefaultEventImage();
    }

    try {
      // If it's already a full URL, return as is
      if (imageStr.startsWith("http")) {
        console.log("Image is already a URL:", imageStr);
        return imageStr;
      }

      // Otherwise, construct URL with base path
      const finalUrl = `${IMAGE_BASE_URL}${imageStr}`;
      console.log("Constructed image URL:", finalUrl);
      return finalUrl;
    } catch (error) {
      console.warn("Error parsing event image:", error);
      return getDefaultEventImage();
    }
  };

  // Parse attendees from going array
  const parseGoingUsers = (goingArray: any[]): EventAttendee[] => {
    if (!goingArray || !Array.isArray(goingArray)) return [];

    return goingArray.map((user: any) => {
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
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";
      }

      return {
        id: user.id || user.name || Math.random().toString(),
        name: user.name || "Unknown User",
        image: imageUrl,
      };
    });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "events");
      formData.append("user_id", user?.user_id || "");
      console.log("formData loadData", JSON.stringify(formData));
      const response = await apiCall(formData);
      console.log("response loadData", JSON.stringify(response));
      if (Array.isArray(response?.data)) {
        console.log("Raw event data:", response.data[0]);
        const formattedEvents = response.data.map((event: any) => {
          const goingUsers = parseGoingUsers(event.going || []);
          console.log("Going users parsed:", goingUsers);

          // Get localized values
          const localizedTitle = getLocalizedValue(
            event,
            "title",
            event.title || t("events.defaultTitle")
          );
          const localizedCategory = getLocalizedValue(
            event,
            "category",
            event.category || t("events.defaultCategory")
          );
          const localizedDescription = getLocalizedValue(
            event,
            "detail",
            event.detail ||
              event.description ||
              event.details ||
              t("events.defaultDescription")
          );
          const localizedAddress = getLocalizedValue(
            event,
            "address",
            event.address || event.location || t("events.defaultLocation")
          );

          // Special handling for organizer - check org_by_languages field
          let localizedOrganizer =
            event.organized_by || t("events.defaultOrganizer");
          if (event.org_by_languages) {
            try {
              const orgLanguages =
                typeof event.org_by_languages === "string"
                  ? JSON.parse(event.org_by_languages)
                  : event.org_by_languages;
              const currentLang = i18n.language || "en";
              const langCode = currentLang.split("-")[0];
              localizedOrganizer =
                orgLanguages[langCode] ||
                orgLanguages["en"] ||
                localizedOrganizer;
            } catch (error) {
              console.warn("Error parsing org_by_languages:", error);
            }
          }

          const formattedEvent = {
            id: event.id || Math.random().toString(),
            title: localizedTitle,
            category: localizedCategory,
            date: event.date || new Date().toISOString(),
            time: event.time,
            location: localizedAddress,
            address: localizedAddress,
            description: localizedDescription,
            image: parseEventImage(event.image || event.event_image),
            organizer: {
              name: localizedOrganizer,
              image:
                event.organizer_image ||
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
              verified:
                event.organizer_verified === "1" ||
                event.verified === "1" ||
                false,
            },
            attendees: goingUsers.slice(0, 3), // Show only first 3 attendees
            totalAttendees: event.going_count || goingUsers.length || 0,
            isAttending: event.user_going === "1" || event.user_going === 1,
            timeAgo: formatTimeAgo(
              event.created_date || event.date,
              event.created_time || "00:00:00"
            ),
            // New fields
            going: goingUsers,
            going_count: event.going_count || 0,
            user_going: event.user_going || "0",
          };
          console.log("Formatted event:", formattedEvent);
          return formattedEvent;
        });

        setEvents(formattedEvents);
        // Don't set error for empty data - let UI show empty state
        setError(null);
      } else if (response?.status === "Error") {
        // Actual API error
        setEvents([]);
        setError(response.message || t("events.failedToLoadEvents"));
      } else {
        // No data returned but no error
        setEvents([]);
        setError(null); // Don't set error - just empty data
      }
    } catch (error: any) {
      const errorMessage = error.message || t("events.networkError");
      setError(errorMessage);
      console.error("Fetch events error:", error);
    } finally {
      setLoading(false);
    }
  }, [user, i18n.language, t]);

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
              going_count: e.isAttending
                ? e.going_count - 1
                : e.going_count + 1,
              user_going: e.isAttending ? "0" : "1",
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
                  going_count: event.going_count,
                  user_going: event.user_going,
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
                going_count: event.going_count,
                user_going: event.user_going,
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
  }, [i18n.language]);

  return {
    loading,
    events,
    error,
    refetch: loadData,
    toggleAttendance,
  };
};

export default useGetEvents;
