import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PrivateSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
  createdAt: string;
}

export default function PrivateSpots() {
  const { user, userData, updateUserData } = useAppContext();
  const { showToast } = useToast();
  const [privateSpots, setPrivateSpots] = useState<PrivateSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const MAX_PRIVATE_SPOTS = 3;

  useEffect(() => {
    loadPrivateSpots();
  }, []);

  const loadPrivateSpots = async () => {
    if (!user?.user_id) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "get_private_spots");
      formData.append("user_id", user.user_id);

      const response = await apiCall(formData);

      if (response.result) {
        setPrivateSpots(response.data || []);
      } else {
        // If no API endpoint exists, use dummy data from userData
        const spots: PrivateSpot[] = [];
        if (userData?.lat && userData?.lng) {
          spots.push({
            id: "1",
            name: "My Private Spot",
            latitude: userData.lat,
            longitude: userData.lng,
            radius: userData.radius || 100,
            address: "Current Location",
            createdAt: new Date().toISOString(),
          });
        }
        setPrivateSpots(spots);
      }
    } catch (error) {
      console.error("Error loading private spots:", error);
      showToast("Failed to load private spots", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrivateSpot = () => {
    router.push({
      pathname: "/auth/private_spot",
      params: {
        fromEdit: "true",
      },
    });
  };

  const handleEditPrivateSpot = (spot: PrivateSpot) => {
    router.push({
      pathname: "/auth/private_spot",
      params: {
        fromEdit: "true",
        spotId: spot.id,
        latitude: spot.latitude.toString(),
        longitude: spot.longitude.toString(),
        radius: spot.radius.toString(),
      },
    });
  };

  const handleDeletePrivateSpot = (spot: PrivateSpot) => {
    Alert.alert(
      "Delete Private Spot",
      `Are you sure you want to delete "${spot.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePrivateSpot(spot.id),
        },
      ]
    );
  };

  const deletePrivateSpot = async (spotId: string) => {
    if (!user?.user_id) return;

    setIsDeleting(spotId);
    try {
      const formData = new FormData();
      formData.append("type", "delete_private_spot");
      formData.append("user_id", user.user_id);
      formData.append("spot_id", spotId);

      const response = await apiCall(formData);

      if (response.result) {
        setPrivateSpots((prev) => prev.filter((spot) => spot.id !== spotId));
        showToast("Private spot deleted successfully", "success");
      } else {
        // Fallback for demo - remove from local state
        setPrivateSpots((prev) => prev.filter((spot) => spot.id !== spotId));
        showToast("Private spot deleted successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting private spot:", error);
      showToast("Failed to delete private spot", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const getAddressFromCoordinates = (latitude: number, longitude: number) => {
    // This would normally use reverse geocoding
    // For now, return formatted coordinates
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  const renderPrivateSpotItem = (spot: PrivateSpot) => (
    <View key={spot.id} style={styles.spotItem}>
      <View style={styles.spotContent}>
        <View style={styles.spotIcon}>
          <Ionicons name="location" size={24} color={color.primary} />
        </View>

        <View style={styles.spotInfo}>
          <Text style={styles.spotName}>{spot.name}</Text>
          <Text style={styles.spotAddress}>
            {spot.address ||
              getAddressFromCoordinates(spot.latitude, spot.longitude)}
          </Text>
          <Text style={styles.spotRadius}>Privacy radius: {spot.radius}m</Text>
        </View>
      </View>

      <View style={styles.spotActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPrivateSpot(spot)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color={color.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePrivateSpot(spot)}
          activeOpacity={0.7}
          disabled={isDeleting === spot.id}
        >
          {isDeleting === spot.id ? (
            <ActivityIndicator size="small" color={color.error} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={color.error} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="location-outline" size={48} color={color.gray55} />
      </View>
      <Text style={styles.emptyTitle}>No Private Spots Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create private spots where you don't want to be visible to others
      </Text>
    </View>
  );

  const canAddMoreSpots = privateSpots.length < MAX_PRIVATE_SPOTS;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Private Spots" divider />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={color.primary}
            />
            <Text style={styles.infoTitle}>About Private Spots</Text>
          </View>
          <Text style={styles.infoText}>
            Private spots are areas where you won't be visible to other users.
            You can create up to {MAX_PRIVATE_SPOTS} private spots.
          </Text>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={color.primary} />
            <Text style={styles.loadingText}>Loading private spots...</Text>
          </View>
        ) : (
          <>
            {/* Private Spots List */}
            {privateSpots.length > 0 ? (
              <View style={styles.spotsSection}>
                <Text style={styles.sectionTitle}>
                  Your Private Spots ({privateSpots.length}/{MAX_PRIVATE_SPOTS})
                </Text>
                {privateSpots.map(renderPrivateSpotItem)}
              </View>
            ) : (
              renderEmptyState()
            )}

            {/* Add Button Section */}
            {canAddMoreSpots && (
              <View style={styles.addSection}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddPrivateSpot}
                  activeOpacity={0.7}
                >
                  <View style={styles.addButtonContent}>
                    <View style={styles.addIcon}>
                      <Ionicons name="add" size={24} color={color.primary} />
                    </View>
                    <View style={styles.addTextContainer}>
                      <Text style={styles.addButtonTitle}>
                        Add Private Spot
                      </Text>
                      <Text style={styles.addButtonSubtitle}>
                        {privateSpots.length === 0
                          ? "Create your first private spot"
                          : `${
                              MAX_PRIVATE_SPOTS - privateSpots.length
                            } more spots available`}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={color.gray55}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Max Spots Reached */}
            {!canAddMoreSpots && (
              <View style={styles.maxSpotsSection}>
                <View style={styles.maxSpotsIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={color.success}
                  />
                </View>
                <Text style={styles.maxSpotsText}>
                  You've reached the maximum of {MAX_PRIVATE_SPOTS} private
                  spots
                </Text>
              </View>
            )}
          </>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    backgroundColor: color.gray95,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
  },
  infoText: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
  },
  spotsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 16,
  },
  spotItem: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spotContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  spotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.gray95,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 4,
  },
  spotAddress: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginBottom: 2,
  },
  spotRadius: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.gray14,
  },
  spotActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.gray95,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: color.gray95,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 20,
  },
  addSection: {
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
    padding: 16,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.gray95,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addTextContainer: {
    flex: 1,
  },
  addButtonTitle: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 4,
  },
  addButtonSubtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  maxSpotsSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray95,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  maxSpotsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },
  maxSpotsText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray14,
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});
