import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import CustomButton from "./custom_button";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function InviteMatches({
  visible,
  onClose,
  onBack,
  onSendInvites,
  eventTitle = "Event",
  eventId,
}: any) {
  const { user } = useAppContext();
  const { showToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample matches data - replace with your actual matches
  const matches = [
    {
      id: "1",
      name: "Alex",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      isOnline: true,
    },
    {
      id: "2",
      name: "Sam",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      isOnline: false,
    },
    {
      id: "3",
      name: "Jordan",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      isOnline: true,
    },
    {
      id: "4",
      name: "Emma",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      isOnline: false,
    },
    {
      id: "5",
      name: "David",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      isOnline: true,
    },
  ];

  // Filter matches based on search text
  const filteredMatches = matches.filter((match) =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatches((prev) => {
      if (prev.includes(matchId)) {
        return prev.filter((id) => id !== matchId);
      } else {
        return [...prev, matchId];
      }
    });
  };

  const handleSendInvites = async () => {
    if (!user?.user_id) {
      console.error("User ID not available");
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("user_id", user.user_id);
      formData.append("table_name", "event_invites");
      console.log("first", eventId);
      formData.append("event_id", eventId.toString());
      formData.append("invited_id", JSON.stringify(selectedMatches));
      console.log("formData", formData);
      const response = await apiCall(formData);

      if (response.result) {

        const selectedMatchesData = matches.filter((match) =>
          selectedMatches.includes(match.id)
        );

        if (onSendInvites) {
          onSendInvites(selectedMatchesData);
        }

        setSelectedMatches([]);
        setSearchText("");
        onClose();
      } else {
        showToast(response.message || "Failed to send invites", "error");
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMatchItem = ({ item }: any) => {
    const isSelected = selectedMatches.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => handleMatchSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.matchContent}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.matchImage} />
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <Text style={styles.matchName}>{item.name}</Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={color.white} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Invite Matches</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={color.black} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color={color.gray14}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search matches..."
                placeholderTextColor={color.gray14}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  style={styles.clearButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={color.gray14}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Matches List */}
          <FlatList
            data={filteredMatches}
            renderItem={renderMatchItem}
            keyExtractor={(item) => item.id}
            style={styles.matchesList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Selection Count */}
            <Text style={styles.selectionCount}>
              {selectedMatches.length} match
              {selectedMatches.length !== 1 ? "es" : ""} selected
            </Text>

            <CustomButton
              title={isSubmitting ? "Sending..." : "Send Invites"}
              onPress={handleSendInvites}
              isDisabled={selectedMatches.length === 0 || isSubmitting}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  matchesList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  matchContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    marginRight: 16,
  },
  matchImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: color.white,
  },
  matchName: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: color.gray94,
  },
  selectionCount: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray14,
    textAlign: "center",
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: "#5FB3D4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: color.gray14,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
});
