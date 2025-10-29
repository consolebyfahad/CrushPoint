import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EventCard({ event, onPress, onToggleAttending }: any) {
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress(event);
    } else {
    }
  };

  const handleToggleAttending = () => {
    if (onToggleAttending) {
      onToggleAttending(event);
    } else {
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Event Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />

        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={color.black}
            style={styles.calendarIcon}
          />
          <Text style={styles.dateText}>{event.date}</Text>
        </View>

        {/* Category Badge */}
        {event.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        )}

        {/* Going Badge - Only show if user is attending */}
        {event.isAttending && (
          <View style={styles.goingBadge}>
            <Text style={styles.goingText}>{t("events.going")}</Text>
          </View>
        )}
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={color.gray69} />
          <Text style={styles.locationText} numberOfLines={1}>
            {event.address}
          </Text>
        </View>

        {/* Time Info */}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color={color.gray69} />
          <Text style={styles.timeText}>{event.time}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>

        {/* Attendees Info */}
        <TouchableOpacity
          style={styles.attendeesRow}
          onPress={handleToggleAttending}
          activeOpacity={0.7}
        >
          <View style={styles.attendeesInfo}>
            <Ionicons name="people-outline" size={14} color={color.gray69} />
            <Text style={styles.attendeesText}>
              {event.totalAttendees || event.attendees || 0}{" "}
              {t("events.attending")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={color.gray69} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: color.gray55,
    borderWidth: 1,
    borderColor: color.gray87,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  dateBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.9,
    shadowRadius: 9,
    elevation: 5,
  },
  calendarIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: font.semiBold,
    color: color.black,
  },
  categoryBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: color.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: font.semiBold,
    color: color.white,
  },
  goingBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goingText: {
    fontSize: 12,
    fontFamily: font.semiBold,
    color: color.white,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
    marginLeft: 4,
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 20,
    marginBottom: 16,
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attendeesInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeesText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray69,
    marginLeft: 4,
  },
});
