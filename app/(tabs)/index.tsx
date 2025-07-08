import ListView from "@/app/home/list_view";
import MapView from "@/app/home/map_view";
import AccessLocation from "@/components/enable_location";
import Filters from "@/components/filters";
import Height from "@/components/height";
import LookingFor from "@/components/looking_for";
import Nationality from "@/components/nationality";
import Religion from "@/components/religion";
import ZodiacSign from "@/components/zodic";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { requestUserLocation } from "@/utils/location";
import {
  getFCMToken,
  requestFCMPermission,
  setupNotificationListeners,
} from "@/utils/notification";
import { BellIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
  const { user, updateUserData } = useAppContext();
  const [viewType, setViewType] = useState("Map");
  const [showFilters, setShowFilters] = useState(false);
  const [showLookingFor, setShowLookingFor] = useState(false);
  const [showHeight, setShowHeight] = useState(false);
  const [showNationality, setShowNationality] = useState(false);
  const [showReligion, setShowReligion] = useState(false);
  const [showZodiac, setShowZodiac] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermissionGranted(true);
        setShowLocationModal(false);
      }
    })();
  }, []);

  useEffect(() => {
    requestNotificationPermissions();
    const handleNotificationPress = (data: any) => {
      console.log("🔔 Notification Pressed:", data);
    };
    const unsubscribe = setupNotificationListeners(handleNotificationPress);
    return () => {
      unsubscribe();
    };
  }, []);

  const getDeviceInfo = async () => {
    try {
      return {
        platform: Platform.OS || "",
        model: Device.modelName || "unknown",
      };
    } catch (error) {
      console.error("Error getting device info:", error);
      return {
        platform: Platform.OS || "",
        model: "unknown",
      };
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      console.log("🔔 Requesting notification permissions...");
      const permissionGranted = await requestFCMPermission();

      if (permissionGranted) {
        console.log("✅ Notification permission granted");
        await registerFCMToken();
      } else {
        console.log("❌ Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
    }
  };

  const registerFCMToken = async () => {
    try {
      const token = await getFCMToken();
      if (!token || !user?.user_id) return;

      const deviceInfo = await getDeviceInfo();
      const formData = new FormData();
      formData.append("type", "update_noti");
      formData.append("user_id", user.user_id);
      formData.append("devicePlatform", deviceInfo.platform);
      formData.append("deviceRid", token);
      formData.append("deviceModel", deviceInfo.model);

      const response = await apiCall(formData);
      console.log("✅ FCM token registered:", response.success);
    } catch (error) {
      console.error("❌ FCM registration failed:", error);
    }
  };

  const handleAllowLocation = async () => {
    const location = await requestUserLocation();
    if (location) {
      try {
        const formData = new FormData();
        formData.append("type", "add_data");
        formData.append("table_name", "user_locations");
        formData.append("user_id", user!.user_id);
        formData.append("lat", location?.latitude.toString());
        formData.append("lng", location.longitude.toString());

        const response = await apiCall(formData);
        if (response.result) {
          updateUserData({
            lat: location.latitude,
            lng: location.longitude,
          });
          setLocationPermissionGranted(true);
          setShowLocationModal(false);
        }
      } catch (error) {
        console.error("❌ Failed to save location:", error);
      }
    }
  };

  // Filter data state
  const [filterData, setFilterData] = useState({
    gender: "Men",
    ageFrom: "18",
    ageTo: "35",
    distance: 10,
    lookingFor: null,
    height: null,
    nationality: null,
    religion: null,
    zodiacSign: null,
  });

  // Header handlers
  const handleNotifications = () => {
    router.push("/notifications");
    console.log("Open notifications");
  };

  const handleFilters = () => {
    setShowFilters(true);
  };

  // Modal close handlers
  const closeAllModals = () => {
    setShowFilters(false);
    setShowLookingFor(false);
    setShowHeight(false);
    setShowNationality(false);
    setShowReligion(false);
    setShowZodiac(false);
  };

  // Navigation handlers
  const handleNavigateToLookingFor = () => {
    setShowFilters(false);
    setShowLookingFor(true);
  };

  const handleNavigateToHeight = () => {
    setShowFilters(false);
    setShowHeight(true);
  };

  const handleNavigateToNationality = () => {
    setShowFilters(false);
    setShowNationality(true);
  };

  const handleNavigateToReligion = () => {
    setShowFilters(false);
    setShowReligion(true);
  };

  const handleNavigateToZodiac = () => {
    setShowFilters(false);
    setShowZodiac(true);
  };

  // Back to filters handler
  const handleBackToFilters = () => {
    closeAllModals();
    setShowFilters(true);
  };

  // User interaction handlers
  const handleViewProfile = (userData: any) => {
    console.log("View profile for:", userData);
    router.push({
      pathname: "/profile/user_profile",
      params: {
        user: JSON.stringify(userData),
        userId: userData.id,
      },
    });
  };

  const handleBookmark = (user: any) => {
    console.log("Bookmark user:", user);
    // Handle bookmark logic
  };

  const handleClose = () => {
    setShowHeight(false);
    setShowLookingFor(false);
    setShowFilters(true);
  };

  const handleSelect = () => {
    setShowNationality(false);
    setShowReligion(false);
    setShowZodiac(false);
    setShowFilters(true);
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      {viewType === "List View" ? (
        <ListView
          onViewProfile={handleViewProfile}
          onBookmark={handleBookmark}
        />
      ) : (
        <MapView onUserPress={handleViewProfile} />
      )}

      {/* Top Header */}
      <SafeAreaView style={styles.topHeader}>
        <View style={styles.headerContent}>
          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotifications}
            activeOpacity={0.8}
          >
            <BellIcon />
          </TouchableOpacity>

          {/* Map/List Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewType === "Map" && styles.activeToggle,
              ]}
              onPress={() => setViewType("Map")}
              activeOpacity={0.8}
            >
              <Feather name="map" size={18} color="black" />
              <Text
                style={[
                  styles.toggleText,
                  viewType === "Map"
                    ? styles.activeToggleText
                    : styles.inactiveToggleText,
                ]}
              >
                Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewType === "List View" && styles.activeToggle,
              ]}
              onPress={() => setViewType("List View")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewType === "List View" ? color.black : color.gray14}
              />
              <Text
                style={[
                  styles.toggleText,
                  viewType === "List View"
                    ? styles.activeToggleText
                    : styles.inactiveToggleText,
                ]}
              >
                List View
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFilters}
            activeOpacity={0.8}
          >
            <MaterialIcons name="filter-list" size={24} color={color.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <Filters
            onClose={() => setShowFilters(false)}
            onNavigateToLookingFor={handleNavigateToLookingFor}
            onNavigateToHeight={handleNavigateToHeight}
            onNavigateToNationality={handleNavigateToNationality}
            onNavigateToReligion={handleNavigateToReligion}
            onNavigateToZodiac={handleNavigateToZodiac}
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </View>
      </Modal>

      {/* Looking For Modal */}
      <Modal
        visible={showLookingFor}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLookingFor(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowLookingFor(false)}
          />
          <LookingFor
            onClose={handleClose}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </View>
      </Modal>

      {/* Height Modal */}
      <Modal
        visible={showHeight}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHeight(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowHeight(false)}
          />
          <Height
            onClose={handleClose}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </View>
      </Modal>

      {/* Nationality Modal */}
      <Modal
        visible={showNationality}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNationality(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowNationality(false)}
          />
          <Nationality
            onClose={() => setShowNationality(false)}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
            onSelect={handleSelect}
          />
        </View>
      </Modal>

      {/* Religion Modal */}
      <Modal
        visible={showReligion}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReligion(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowReligion(false)}
          />
          <Religion
            onClose={() => setShowReligion(false)}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
            onSelect={handleSelect}
          />
        </View>
      </Modal>

      {/* Zodiac Sign Modal */}
      <Modal
        visible={showZodiac}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowZodiac(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowZodiac(false)}
          />
          <ZodiacSign
            onClose={() => setShowZodiac(false)}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
            onSelect={handleSelect}
          />
        </View>
      </Modal>

      <AccessLocation
        visible={showLocationModal && !locationPermissionGranted}
        onAllow={handleAllowLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: color.gray69,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: color.gray94,
    borderRadius: 99,
    padding: 4,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  activeToggle: {
    backgroundColor: color.white,
    shadowColor: color.gray55,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },

  toggleText: {
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  activeToggleText: {
    color: color.black,
  },
  inactiveToggleText: {
    color: color.black,
  },
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
});
