import ListView from "@/app/home/list_view";
import MapView from "@/app/home/map_view";
import AccessLocation from "@/components/enable_location";
import Filters from "@/components/filters";
import LookingFor from "@/components/looking_for";
import Nationality from "@/components/nationality";
import Religion from "@/components/religion";
import ZodiacSign from "@/components/zodic";
import { useAppContext } from "@/context/app_context";
import useGetInterests from "@/hooks/useGetInterests";
import useGetUsers from "@/hooks/useGetUsers";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import {
  formatGenderInterest,
  formatReligion,
  formatZodiac,
  parseInterestsWithNames,
  parseJsonString,
  parseNationalityWithLabels
} from "@/utils/helper";
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
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserFilters {
  gender?: string;
  ageFrom?: string;
  ageTo?: string;
  distance?: number;
  lookingFor?: string;
  nationality?: string;
  religion?: string;
  zodiacSign?: string;
}

export default function Index() {
  // Get interests from API for interest name conversion
  const { interests: apiInterests } = useGetInterests();
  const { t } = useTranslation();
  const { user, updateUserData, userData } = useAppContext();
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  // Disable swipe back gesture on iOS
  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        gestureEnabled: false,
      });
    }
  }, [navigation]);

  // Filter data state - memoized to prevent unnecessary re-renders
  const initialFilterData = useMemo(
    () => ({
      gender:
        formatGenderInterest(userData?.gender_interest || "", t) ||
        t("filters.both"),
      ageFrom: "18",
      ageTo: "35",
      distance: 50,
      lookingFor: undefined,
      nationality: undefined,
      religion: undefined,
      zodiacSign: undefined,
    }),
    [t, userData?.gender_interest]
  );

  const [filterData, setFilterData] = useState<UserFilters>(initialFilterData);

  // Update filter data when userData changes
  useEffect(() => {
    if (userData?.gender_interest) {
      const updatedGender = formatGenderInterest(userData.gender_interest, t);

      setFilterData((prev) => ({
        ...prev,
        gender: updatedGender,
      }));
    }
  }, [userData?.gender_interest, t]);


  const { users, loading, error, refetch } = useGetUsers(filterData);
  const [viewType, setViewType] = useState(t("common.mapView"));
  const [selectedUser, setSelectedUser] = useState<any>(null);
  // Modal states
  const [showFilters, setShowFilters] = useState(false);
  const [showLookingFor, setShowLookingFor] = useState(false);
  const [showHeight, setShowHeight] = useState(false);
  const [showNationality, setShowNationality] = useState(false);
  const [showReligion, setShowReligion] = useState(false);
  const [showZodiac, setShowZodiac] = useState(false);

  // Location states
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Prevent going back to auth screens
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  // Update location every time user comes to this screen
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const updateCurrentLocation = async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();

          if (status === "granted") {
            setLocationPermissionGranted(true);
            setShowLocationModal(false);

            const location = await requestUserLocation();

            if (location && isActive) {
              setCurrentLocation(location);
              await updateLocationInDatabase(location);
            }
          } else {
            setLocationPermissionGranted(false);
            setShowLocationModal(true);
          }
        } catch (error) {

        }
      };

      updateCurrentLocation();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Update location in database
  const updateLocationInDatabase = async (location: any) => {
    if (!user?.user_id || !location) return;

    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "user_locations");
      formData.append("user_id", user.user_id);
      formData.append("lat", location.latitude.toString());
      formData.append("lng", location.longitude.toString());
      const response = await apiCall(formData);

      if (response.result || response.success) {
        updateUserData({
          lat: location.latitude,
          lng: location.longitude,
        });
      }
    } catch (error) {

    }
  };

  // Track if notification has been handled to prevent duplicates
  const notificationHandledRef = useRef<Set<string>>(new Set());

  // Notification setup
  useEffect(() => {
    requestNotificationPermissions();

    const handleNotificationPress = async (data: any, notificationBody?: string) => {
      // Check if this is a match notification by checking the notification body
      const isMatchNotification = notificationBody?.toLowerCase().includes("match") || 
                                   notificationBody?.toLowerCase().includes("new match");
      
      // Only handle match notifications - navigate to match2 screen
      // For all other notifications (chat, message, etc.), just show the push notification without navigation
      if (data?.date_id && isMatchNotification) {
        // Create unique key for this notification
        const notificationKey = `${data.date_id}_${Date.now()}`;

        // Check if this notification was already handled recently (within 2 seconds)
        const recentKeys = Array.from(notificationHandledRef.current).filter(
          (key) => {
            const timestamp = parseInt(key.split("_")[1]);
            return Date.now() - timestamp < 2000; // 2 seconds
          }
        );

        // Clean up old keys
        notificationHandledRef.current = new Set(recentKeys);

        // Check if we already have a recent notification for this date_id
        const alreadyHandled = recentKeys.some((key) =>
          key.startsWith(`${data.date_id}_`)
        );

        if (alreadyHandled) {

          return;
        }

        // Mark as handled
        notificationHandledRef.current.add(notificationKey);

        try {
          const matchData = await fetchMatchData(data.date_id);
          if (matchData) {
            router.push({
              pathname: "/profile/match2",
              params: {
                matchData: JSON.stringify(matchData),
              },
            });
          }
        } catch (error) {
        }
      }
    };

    const unsubscribe = setupNotificationListeners(handleNotificationPress);

    return () => {
      unsubscribe();
    };
  }, []); // Empty deps is fine - we use ref for state

  // Ref to track processed params to prevent re-processing
  const processedParamsRef = useRef<Set<string>>(new Set());

  // Handle navigation parameters from user profile
  useEffect(() => {
    // Create a unique key for these params
    const paramKey = `${params.selectedUserId}_${params._timestamp || ""}`;
    
    // Skip if we've already processed these params
    if (processedParamsRef.current.has(paramKey)) {
      return;
    }

    if (params.viewType) {
      setViewType(params.viewType as string);
    }

    if (params.selectedUserId && params.selectedUserLocation) {
      try {
        const locationData = JSON.parse(params.selectedUserLocation as string);
        const selectedUserData = {
          id: params.selectedUserId,
          name: params.selectedUserName,
          ...locationData,
        };

        // Mark these params as processed
        processedParamsRef.current.add(paramKey);

        // Switch to map view first
        setViewType(t("common.mapView"));

        // Longer delay to ensure map is fully loaded and ready
        // This prevents the map from freezing
        setTimeout(() => {
          setSelectedUser(selectedUserData);

          // Auto-clear selection after 10 seconds for better UX
          setTimeout(() => {
            setSelectedUser(null);
          }, 10000);
        }, 500); // Increased from 100ms to 500ms to ensure map is ready
      } catch (error) {

      }
    }

    // Clean up old param keys (keep only last 10)
    if (processedParamsRef.current.size > 10) {
      const keysArray = Array.from(processedParamsRef.current);
      processedParamsRef.current.clear();
      keysArray.slice(-10).forEach((key) => {
        processedParamsRef.current.add(key);
      });
    }
  }, [params, t]);

  const fetchMatchData = async (dateId: string) => {
    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "users");
      formData.append("id", dateId);

      const response = await apiCall(formData);
      if (response) {
        // Check if response.data is an array (as shown in your terminal logs)
        const matchedUserData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        // Parse the images array from the API response
        let parsedImages = [];
        try {
          if (matchedUserData?.images) {
            // Clean up the escaped quotes in the JSON string
            const cleanedImagesString = matchedUserData.images.replace(
              /\\"/g,
              '"'
            );
            parsedImages = JSON.parse(cleanedImagesString);
          }
        } catch (error) {

        }

        // Calculate age from date of birth
        const calculateAge = (dob: string) => {
          if (!dob) return 0;
          try {
            // Handle different date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
            let birthDate: Date;
            if (dob.includes("/")) {
              const parts = dob.split("/");
              if (parts.length === 3) {
                // Try MM/DD/YYYY format first
                birthDate = new Date(
                  `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(
                    2,
                    "0"
                  )}`
                );
                // If invalid, try DD/MM/YYYY format
                if (isNaN(birthDate.getTime())) {
                  birthDate = new Date(
                    `${parts[2]}-${parts[1].padStart(
                      2,
                      "0"
                    )}-${parts[0].padStart(2, "0")}`
                  );
                }
              } else {
                birthDate = new Date(dob);
              }
            } else {
              birthDate = new Date(dob);
            }

            if (isNaN(birthDate.getTime())) {

              return 0;
            }

            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              age--;
            }
            return age;
          } catch (error) {

            return 0;
          }
        };

        // Format distance
        const formatDistance = (distance: number) => {
          if (distance === null || distance === undefined || distance === 0) {
            return t("common.unknown");
          }
          if (distance < 1) {
            return `${Math.round(distance * 1000)}m away`;
          }
          return `${Math.round(distance * 10) / 10}km away`;
        };

        // Get the first image from the parsed images array
        const getProfileImage = () => {
          if (parsedImages && parsedImages.length > 0) {
            return `https://api.andra-dating.com/images/${parsedImages[0]}`;
          }
          return (
            matchedUserData?.image_url ||
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
          );
        };

        // Parse current user images from context userData
        let currentUserImages: string[] = [];

        try {
          if (userData.images && typeof userData.images === "string") {
            // Clean up the escaped quotes in the JSON string
            const imagesString = userData.images as string;
            const cleanedImagesString = imagesString.replace(/\\"/g, '"');
            currentUserImages = JSON.parse(cleanedImagesString);
          } else if (Array.isArray(userData.images)) {
            // Check if the array contains strings or nested arrays/objects
            if (
              userData.images.length > 0 &&
              typeof userData.images[0] === "string"
            ) {
              // Check if the string is a JSON array or just a filename
              const firstElement = userData.images[0] as string;
              if (firstElement.includes("[") && firstElement.includes("]")) {
                // It's a stringified array, parse it
                const cleanedString = firstElement.replace(/\\"/g, '"');
                currentUserImages = JSON.parse(cleanedString);
              } else {
                // It's a direct filename, use the array as is
                currentUserImages = userData.images as string[];
              }
            } else if (
              userData.images.length > 0 &&
              typeof userData.images[0] === "object"
            ) {
              // If it's an array containing objects/arrays, try to parse the first element
              const firstElement = userData.images[0] as any;
              if (
                typeof firstElement === "string" &&
                firstElement.includes("[")
              ) {
                // It's a stringified array, parse it
                const cleanedString = firstElement.replace(/\\"/g, '"');
                currentUserImages = JSON.parse(cleanedString);
              } else {
                currentUserImages = [];
              }
            } else {
              currentUserImages = [];
            }
          } else {
          }
        } catch (error) {

        }

        // Get current user image
        const getCurrentUserImage = () => {
          if (currentUserImages && currentUserImages.length > 0) {
            const imageUrl = `https://api.andra-dating.com/images/${currentUserImages[0]}`;
            return imageUrl;
          }
          return "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face";
        };

        // Parse and translate user data
        const parseUserData = (data: any) => {
          try {
            // Parse looking_for to get raw IDs for dynamic formatting
            let lookingForIds: string[] = [];
            try {
              const rawIds = parseJsonString(data?.looking_for || "[]");
              lookingForIds = Array.isArray(rawIds) ? rawIds : [];
            } catch (error) {

            }

            return {
              interests: parseInterestsWithNames(
                data?.interests || "[]",
                apiInterests,
              ),
              lookingFor: lookingForIds, // Store raw IDs for dynamic formatting
              nationality: parseNationalityWithLabels(
                data?.nationality || "[]",
                t
              ),
              religion: formatReligion(data?.religion || "", t),
              zodiac: formatZodiac(data?.zodiac || "", t),
            };
          } catch (error) {

            return {
              interests: [],
              lookingFor: [],
              nationality: [],
              religion: "",
              zodiac: "",
            };
          }
        };

        const parsedUserData = parseUserData(matchedUserData);

        const matchData = {
          currentUser: {
            name: userData.name || "You",
            image: getCurrentUserImage(),
            lat: userData.lat || "",
            lng: userData.lng || "",
          },
          matchedUser: {
            name: matchedUserData?.name || t("common.unknown"),
            age: calculateAge(matchedUserData?.dob),
            distance: formatDistance(matchedUserData?.distance),
            image: getProfileImage(),
            id: matchedUserData?.id,
            // Additional user data for profile
            about: matchedUserData?.about || "",
            city: matchedUserData?.city || "",
            country: matchedUserData?.country || "",
            state: matchedUserData?.state || "",
            gender: matchedUserData?.gender || "",
            height: matchedUserData?.height || "",
            nationality: parsedUserData.nationality,
            religion: parsedUserData.religion,
            zodiac: parsedUserData.zodiac,
            languages: matchedUserData?.languages || "",
            interests: parsedUserData.interests,
            lookingFor: parsedUserData.lookingFor,
            lat: matchedUserData?.lat || "",
            lng: matchedUserData?.lng || "",
            images: parsedImages,
            email: matchedUserData?.email || "",
            phone: matchedUserData?.phone || "",
            timestamp: matchedUserData?.timestamp || "",
            uploaded_selfie: matchedUserData?.uploaded_selfie || "",
          },
        };

        return matchData;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const getDeviceInfo = async () => {
    try {
      return {
        platform: Platform.OS || "",
        model: Device.modelName || "unknown",
      };
    } catch (error) {

      return {
        platform: Platform.OS || "",
        model: "unknown",
      };
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const permissionGranted = await requestFCMPermission();

      if (permissionGranted) {
        // Small delay for iOS to complete APNS registration
        if (Platform.OS === "ios") {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        await registerFCMToken();
      } else {
      }
        } catch (error) {
    }
  };

  const registerFCMToken = async () => {
    try {
      const token = await getFCMToken();

      if (!token || !user?.user_id) {
        return;
      }

      const deviceInfo = await getDeviceInfo();

      const formData = new FormData();
      formData.append("type", "update_noti");
      formData.append("user_id", user.user_id);
      formData.append("devicePlatform", deviceInfo.platform);
      formData.append("deviceRid", token);
      formData.append("deviceModel", deviceInfo.model);

      const response = await apiCall(formData);

    } catch (error) {
    }
  };

  const handleAllowLocation = async () => {
    const location = await requestUserLocation();

    if (location) {
      setCurrentLocation(location);

      try {
        const formData = new FormData();
        formData.append("type", "add_data");
        formData.append("table_name", "user_locations");
        formData.append("user_id", user!.user_id);
        formData.append("lat", location?.latitude.toString());
        formData.append("lng", location.longitude.toString());

        const response = await apiCall(formData);

        if (response.result || response.success) {
          updateUserData({
            lat: location.latitude,
            lng: location.longitude,
          });
          setLocationPermissionGranted(true);
          setShowLocationModal(false);
        }
      } catch (error) {

      }
    }
  };

  // Header handlers
  const handleNotifications = () => {
    router.push("/notifications");
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

  const handleBackToFilters = () => {
    closeAllModals();
    setShowFilters(true);
  };

  // User interaction handlers
  const handleViewProfile = (userData: any) => {
    router.push({
      pathname: "/profile/user_profile",
      params: {
        user: JSON.stringify(userData),
        userId: userData.id,
      },
    });
  };

  // UPDATED: Enhanced function to show user on map
  const handleShowUserOnMap = (selectedUser: any) => {
    // Switch to map view first
    setViewType(t("common.mapView"));

    // Small delay to ensure map tab is active before setting selected user
    setTimeout(() => {
      setSelectedUser(selectedUser);

      // Auto-clear selection after 10 seconds for better UX
      setTimeout(() => {
        setSelectedUser(null);
      }, 10000);
    }, 100);
  };

  // Handle manual user deselection
  const handleUserDeselect = () => {
    setSelectedUser(null);
  };

  // NEW: Handle show my location
  const handleShowMyLocation = () => {
    setSelectedUser(null); // Clear any selected user
    // The map will automatically center on current location
  };

  const handleClose = () => {
    setShowHeight(false);
    setShowLookingFor(false);
    setShowNationality(false);
    setShowReligion(false);
    setShowZodiac(false);
    setShowFilters(true);
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      {viewType === t("common.listView") ? (
        <ListView
          onViewProfile={handleViewProfile}
          onShowUserOnMap={handleShowUserOnMap}
          users={users}
          loading={loading}
          error={error}
          refetch={refetch}
        />
      ) : (
        <MapView
          onUserPress={handleViewProfile}
          currentLocation={currentLocation}
          users={users}
          loading={loading}
          error={error}
          refetch={refetch}
          selectedUser={selectedUser}
          onUserDeselect={handleUserDeselect}
          onShowMyLocation={handleShowMyLocation}
        />
      )}

      <LinearGradient
        colors={["rgba(255,255,255,1)", "rgba(255,255,255,0)"]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

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
                viewType === t("common.mapView") && styles.activeToggle,
              ]}
              onPress={() => setViewType(t("common.mapView"))}
              activeOpacity={0.8}
            >
              <Feather name="map" size={18} color="black" />
              <Text
                style={[
                  styles.toggleText,
                  viewType === t("common.mapView")
                    ? styles.activeToggleText
                    : styles.inactiveToggleText,
                ]}
              >
                {t("common.mapView")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewType === t("common.listView") && styles.activeToggle,
              ]}
              onPress={() => setViewType(t("common.listView"))}
              activeOpacity={0.8}
            >
              <Ionicons
                name="list"
                size={18}
                color={
                  viewType === t("common.listView") ? color.black : color.gray14
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  viewType === t("common.listView")
                    ? styles.activeToggleText
                    : styles.inactiveToggleText,
                ]}
              >
                {t("common.listView")}
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

      {/* All Modals remain the same */}
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
            refetch={refetch}
          />
        </View>
      </Modal>

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
            onClose={handleClose}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </View>
      </Modal>

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
            onClose={handleClose}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </View>
      </Modal>

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
            onClose={handleClose}
            onBack={handleBackToFilters}
            filterData={filterData}
            setFilterData={setFilterData}
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
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    zIndex: 8,
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
    borderColor: color.soft200,
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
