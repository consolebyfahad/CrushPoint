import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PrivateSpot = {
  id: string;
  address: string;
  lat: string;
  lng: string;
  radius: string;
  created_at?: string;
};

export default function PrivateSpots() {
  const { user, userData } = useAppContext();
  console.log("user", user);
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const [privateSpots, setPrivateSpots] = useState<PrivateSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if coming from profile edit
  const fromEdit = params.fromEdit === "true";

  const fetchPrivateSpots = async (isRefresh = false) => {
    if (!user?.user_id) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "private_spots");
      formData.append("user_id", user.user_id);

      const response = await apiCall(formData);

      if (response.data) {
        setPrivateSpots(response.data);
      } else {
        setPrivateSpots([]);
      }
    } catch (error) {
      console.error("Error fetching private spots:", error);
      showToast("Failed to load private spots");
      setPrivateSpots([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPrivateSpots();
    }, [user?.user_id])
  );

  const onRefresh = useCallback(() => {
    fetchPrivateSpots(true);
  }, [user?.user_id]);

  const handleAddPrivateSpot = () => {
    router.push({
      pathname: "/auth/private_spot",
      params: {
        mode: "add",
        fromEdit: fromEdit ? "true" : "false",
      },
    });
  };

  const handleEditPrivateSpot = (spot: PrivateSpot) => {
    router.push({
      pathname: "/auth/private_spot",
      params: {
        mode: "edit",
        spotData: JSON.stringify(spot),
        fromEdit: fromEdit ? "true" : "false",
      },
    });
  };

  const handleDeletePrivateSpot = (spot: PrivateSpot) => {
    Alert.alert(
      "Delete Private Spot",
      `Are you sure you want to delete "${spot.address}"?`,
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

    try {
      const formData = new FormData();
      formData.append("type", "delete_data");
      formData.append("table_name", "private_spots");
      formData.append("user_id", user.user_id);
      formData.append("id", spotId);
      console.log(formData);
      const response = await apiCall(formData);

      if (response.result) {
        showToast("Private spot deleted successfully");
        fetchPrivateSpots();
      } else {
        throw new Error(response.message || "Failed to delete private spot");
      }
    } catch (error) {
      console.error("Error deleting private spot:", error);
      showToast("Failed to delete private spot");
    }
  };

  const renderPrivateSpot = (spot: PrivateSpot) => (
    <View key={spot.id} style={styles.spotCard}>
      <View style={styles.spotInfo}>
        <View style={styles.spotHeader}>
          <View style={styles.addressContainer}>
            <SimpleLineIcons
              name="location-pin"
              size={16}
              color={color.primary}
            />
            <Text style={styles.spotAddress} numberOfLines={2}>
              {spot.address}
            </Text>
          </View>
        </View>

        <View style={styles.spotDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Radius:</Text>
            <Text style={styles.detailValue}>{spot.radius} km</Text>
          </View>
        </View>
      </View>

      <View style={styles.spotActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditPrivateSpot(spot)}
          activeOpacity={0.8}
        >
          <Feather name="edit-2" size={16} color={color.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePrivateSpot(spot)}
          activeOpacity={0.8}
        >
          <Feather name="trash-2" size={16} color={color.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <SimpleLineIcons name="location-pin" size={48} color={color.gray87} />
      </View>
      <Text style={styles.emptyTitle}>No Private Spots</Text>
      <Text style={styles.emptySubtitle}>
        Add your first private spot to get started. These locations will help
        you connect with people nearby.
      </Text>
      <CustomButton
        title="Add First Spot"
        onPress={handleAddPrivateSpot}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Private Spots" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <Text style={styles.loadingText}>Loading private spots...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[color.primary]}
            />
          }
        >
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle"
                size={20}
                color={color.primary}
              />
              <Text style={styles.infoText}>
                Private spots are locations where you're most active. They help
                us show you people nearby and improve your matching experience.
              </Text>
            </View>
          </View>

          {privateSpots.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <View style={styles.spotsContainer}>
                {privateSpots.map(renderPrivateSpot)}
              </View>
              {privateSpots.length < 3 && (
                <View style={styles.addMoreContainer}>
                  <CustomButton
                    title="Add Another Spot"
                    onPress={handleAddPrivateSpot}
                    variant="secondary"
                  />
                </View>
              )}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.gray94,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  addButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
  },
  content: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 20,
  },
  spotsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  spotCard: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: color.gray94,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  spotInfo: {
    marginBottom: 16,
  },
  spotHeader: {
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  spotAddress: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    lineHeight: 22,
  },
  spotDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.black,
  },
  spotActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: color.gray94,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F0F9FF",
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.primary,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: color.gray97,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  emptyButton: {
    width: "100%",
  },
  addMoreContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  bottomSpacing: {
    height: 40,
  },
});
