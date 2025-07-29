import { color, font } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MeetupCardProps {
  request: {
    id: string;
    user: {
      id: string;
      name: string;
      image: string;
    };
    status: 'pending' | 'change' | 'accepted' | 'declined';
    timestamp: string;
    date: string;
    time: string;
    location: string;
    message: string;
    hasChanges?: boolean;
    responseMessage?: string;
  };
  type: 'incoming' | 'outgoing';
  onAccept?: (requestId: string) => void;
  onAcceptChanges?: (requestId: string) => void;
  onChange?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
}

export default function MeetupCard({ 
  request, 
  type, 
  onAccept, 
  onAcceptChanges, 
  onChange, 
  onDecline 
}: MeetupCardProps) {
  
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Text style={styles.pendingBadge}>Pending</Text>;
      case 'change':
        return <Text style={styles.changeBadge}>Change</Text>;
      case 'accepted':
        return <Text style={styles.acceptedBadge}>Accepted</Text>;
      case 'declined':
        return <Text style={styles.declinedBadge}>Declined</Text>;
      default:
        return null;
    }
  };

  const renderIncomingButtons = () => {
    if (request.hasChanges) {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => onAcceptChanges?.(request.id)}
          >
            <Ionicons name="checkmark" size={16} color={color.white} />
            <Text style={styles.acceptButtonText}>Accept Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={() => onChange?.(request.id)}
          >
            <Ionicons name="refresh-outline" size={16} color={color.primary} />
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={() => onDecline?.(request.id)}
          >
            <Ionicons name="close" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => onAccept?.(request.id)}
        >
          <Ionicons name="checkmark" size={16} color={color.white} />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.changeButton}
          onPress={() => onChange?.(request.id)}
        >
          <Ionicons name="refresh-outline" size={16} color={color.primary} />
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={() => onDecline?.(request.id)}
        >
          <Ionicons name="close" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: request.user.image }} style={styles.userImage} />
        <View style={styles.headerContent}>
          <Text style={styles.userName}>
            {type === 'incoming' 
              ? `${request.user.name} wants to meet`
              : `Request to ${request.user.name}`
            }
          </Text>
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
      </View>

      {/* Message */}
      <Text style={styles.message}>"{request.message}"</Text>

      {/* Response Message for Outgoing */}
      {type === 'outgoing' && request.responseMessage && (
        <Text style={styles.responseMessage}>{request.responseMessage}</Text>
      )}

      {/* Action Buttons for Incoming */}
      {type === 'incoming' && request.status !== 'accepted' && renderIncomingButtons()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userName: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  pendingBadge: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeBadge: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceptedBadge: {
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  declinedBadge: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  message: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  responseMessage: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});