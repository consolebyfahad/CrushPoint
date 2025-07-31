import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MeetupCardProps {
  request: {
    id: string;
    user: {
      id: string;
      name: string;
      image: string;
    };
    status: "pending" | "change" | "accepted" | "declined" | "cancelled";
    timestamp: string;
    date: string;
    time: string;
    location: string;
    message: string;
    hasChanges?: boolean;
    responseMessage?: string;
  };
  type: "incoming" | "outgoing";
  onAccept?: (requestId: string) => void;
  onAcceptChanges?: (requestId: string) => void;
  onChange?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  onEdit?: (requestId: string) => void;
  isLoading?: boolean;
}

export default function MeetupCard({
  request,
  type,
  onAccept,
  onAcceptChanges,
  onChange,
  onDecline,
  onCancel,
  onEdit,
  isLoading = false,
}: MeetupCardProps) {
  const getStatusBadge = () => {
    switch (request.status) {
      case "pending":
        return <Text style={styles.pendingBadge}>Pending</Text>;
      case "change":
        return <Text style={styles.changeBadge}>Changes Requested</Text>;
      case "accepted":
        return <Text style={styles.acceptedBadge}>Accepted</Text>;
      case "declined":
        return <Text style={styles.declinedBadge}>Declined</Text>;
      case "cancelled":
        return <Text style={styles.cancelledBadge}>Cancelled</Text>;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case "accepted":
        return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
      case "declined":
        return <Ionicons name="close-circle" size={20} color="#FF3B30" />;
      case "cancelled":
        return <Ionicons name="ban" size={20} color="#FF9500" />;
      case "change":
        return <Ionicons name="refresh-circle" size={20} color="#007AFF" />;
      default:
        return <Ionicons name="time" size={20} color="#FF9500" />;
    }
  };

  const renderIncomingButtons = () => {
    // Don't show buttons if request is already processed or loading
    if (
      request.status === "accepted" ||
      request.status === "declined" ||
      isLoading
    ) {
      return null;
    }

    if (request.hasChanges || request.status === "change") {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.acceptButton, isLoading && styles.disabledButton]}
            onPress={() => onAcceptChanges?.(request.id)}
            disabled={isLoading}
          >
            <Ionicons name="checkmark" size={16} color={color.white} />
            <Text style={styles.acceptButtonText}>Accept Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.changeButton, isLoading && styles.disabledButton]}
            onPress={() => onChange?.(request.id)}
            disabled={isLoading}
          >
            <Ionicons name="refresh-outline" size={16} color={color.primary} />
            <Text style={styles.changeButtonText}>Suggest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.declineButton, isLoading && styles.disabledButton]}
            onPress={() => onDecline?.(request.id)}
            disabled={isLoading}
          >
            <Ionicons name="close" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.acceptButton, isLoading && styles.disabledButton]}
          onPress={() => onAccept?.(request.id)}
          disabled={isLoading}
        >
          <Ionicons name="checkmark" size={16} color={color.white} />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.changeButton, isLoading && styles.disabledButton]}
          onPress={() => onChange?.(request.id)}
          disabled={isLoading}
        >
          <Ionicons name="refresh-outline" size={16} color={color.primary} />
          <Text style={styles.changeButtonText}>Suggest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.declineButton, isLoading && styles.disabledButton]}
          onPress={() => onDecline?.(request.id)}
          disabled={isLoading}
        >
          <Ionicons name="close" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderOutgoingButtons = () => {
    // Only show cancel/edit buttons for pending requests
    if (request.status !== "pending" || isLoading) {
      return null;
    }

    return (
      <View style={styles.buttonContainer}>
        {onEdit && (
          <TouchableOpacity
            style={[styles.editButton, isLoading && styles.disabledButton]}
            onPress={() => onEdit(request.id)}
            disabled={isLoading}
          >
            <Ionicons name="pencil-outline" size={16} color={color.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {onCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, isLoading && styles.disabledButton]}
            onPress={() => onCancel(request.id)}
            disabled={isLoading}
          >
            <Ionicons name="close-outline" size={16} color="#FF3B30" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.card, isLoading && styles.cardLoading]}>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.cardLoadingOverlay}>
          <ActivityIndicator size="small" color={color.primary} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: request.user.image }} style={styles.userImage} />
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.userName}>
              {type === "incoming"
                ? `${request.user.name} wants to meet`
                : `Request to ${request.user.name}`}
            </Text>
            {getStatusIcon()}
          </View>
          <Text style={styles.timestamp}>{request.timestamp}</Text>
        </View>
        {getStatusBadge()}
      </View>

      {/* Meeting Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={color.gray55} />
          <Text style={styles.detailText}>{request.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={color.gray55} />
          <Text style={styles.detailText}>{request.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={color.gray55} />
          <Text style={styles.detailText}>{request.location}</Text>
        </View>
        <Text style={styles.message}>"{request.message}"</Text>
      </View>

      {/* Message */}

      {/* Response Message for Outgoing */}
      {type === "outgoing" && request.responseMessage && (
        <View style={[styles.responseContainer]}>
          <Text
            style={[
              styles.responseMessage,
              request.status === "accepted" && styles.responseMessageSuccess,
              request.status === "declined" && styles.responseMessageError,
              request.status === "change" && styles.responseMessageInfo,
            ]}
          >
            {request.responseMessage}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {type === "incoming" && renderIncomingButtons()}
      {/* {type === "outgoing" && renderOutgoingButtons()} */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: color.gray94,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardLoading: {
    opacity: 0.7,
  },
  cardLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  pendingBadge: {
    backgroundColor: "#FFF3CD",
    color: "#856404",
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeBadge: {
    backgroundColor: "#E3F2FD",
    color: "#1976D2",
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceptedBadge: {
    backgroundColor: "#E8F5E8",
    color: "#2E7D32",
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  declinedBadge: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cancelledBadge: {
    backgroundColor: "#FFF3E0",
    color: "#F57C00",
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 12,
    backgroundColor: color.gray97,
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  message: {
    borderTopWidth: 1,
    borderColor: color.gray87,
    paddingTop: 8,
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    fontStyle: "italic",
    // marginBottom: 16,
    lineHeight: 20,
  },
  responseContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    // borderWidth: 1,
  },
  responseMessage: {
    fontSize: 14,
    fontFamily: font.medium,
    textAlign: "center",
    color: color.gray69,
  },
  responseMessageSuccess: {
    color: color.success,
  },
  responseMessageError: {
    color: color.error,
  },
  responseMessageInfo: {
    color: color.gray69,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    color: color.white,
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeButtonText: {
    color: color.primary,
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  declineButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  editButtonText: {
    color: color.primary,
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cancelButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
