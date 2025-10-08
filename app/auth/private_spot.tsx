import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import {
  getCurrentLocationSuggestion,
  getPopularLocations,
  requestUserLocation,
  searchLocations,
} from "@/utils/location";
import { MarkerIcon } from "@/utils/SvgIcons";
import { Ionicons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
type PrivateSpotData = {
  id?: string;
  address: string;
  lat: string;
  lng: string;
  radius: string;
};

export default function PrivateSpot() {
  const { t } = useTranslation();
  const { updateUserData, userData, user } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();

  // Determine mode - check for spot data to determine if editing
  const isEdit = params?.fromEdit === "true";
  const isEditingExistingSpot = params?.mode === "edit" && params?.spotData;

  // Parse existing spot data if editing
  const existingSpotData: PrivateSpotData | null = React.useMemo(() => {
    if (
      isEditingExistingSpot &&
      params.spotData &&
      typeof params.spotData === "string"
    ) {
      try {
        return JSON.parse(params.spotData) as PrivateSpotData;
      } catch (error) {
        console.error("Error parsing spot data:", error);
        return null;
      }
    }
    return null;
  }, [isEditingExistingSpot, params.spotData]);

  const [selectedRadius, setSelectedRadius] = useState(() => {
    if (existingSpotData) {
      const radius = parseInt(existingSpotData.radius);
      return radius <= 100 ? "100m" : "200m";
    }
    return "100m";
  });

  const [mapRegion, setMapRegion] = useState<Region>(() => {
    if (existingSpotData) {
      return {
        latitude: parseFloat(existingSpotData.lat),
        longitude: parseFloat(existingSpotData.lng),
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }
    return {
      latitude: 45.4408474,
      longitude: 12.3155151,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (existingSpotData) {
      // Editing existing spot - use provided data
      const lat = parseFloat(existingSpotData.lat);
      const lng = parseFloat(existingSpotData.lng);

      const existingRegion: Region = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setMapRegion(existingRegion);
      setLocationPermissionGranted(true);
      setIsLoadingLocation(false);
    } else if (isEdit) {
      // Edit mode but using user's current data
      const paramLat = params?.latitude
        ? parseFloat(params.latitude as string)
        : null;
      const paramLng = params?.longitude
        ? parseFloat(params.longitude as string)
        : null;
      const paramRadius = params?.radius
        ? parseInt(params.radius as string)
        : null;

      const lat =
        paramLat ||
        (userData?.lat ? parseFloat(userData.lat.toString()) : null);
      const lng =
        paramLng ||
        (userData?.lng ? parseFloat(userData.lng.toString()) : null);
      const radius = paramRadius || userData?.radius;

      if (lat && lng) {
        const existingRegion: Region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setMapRegion(existingRegion);
        setLocationPermissionGranted(true);
        setIsLoadingLocation(false);
      }

      if (radius) {
        setSelectedRadius(radius === 100 ? "100m" : "200m");
      }
    } else {
      // Adding new spot - get user's current location
      getUserLocation();
    }
  }, [
    existingSpotData,
    isEdit,
    params?.latitude,
    params?.longitude,
    params?.radius,
  ]);

  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await requestUserLocation();

      if (location) {
        setLocationPermissionGranted(true);
        const newRegion: Region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setMapRegion(newRegion);
      } else {
        setLocationPermissionGranted(false);
      }
    } catch (error) {
      console.error("Error getting user location:", error);
      setLocationPermissionGranted(false);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleRadiusSelect = (radius: string) => {
    setSelectedRadius(radius);

    // Adjust map zoom based on radius for better visualization
    const newDelta = radius === "100m" ? 0.005 : 0.008;
    setMapRegion((prev) => ({
      ...prev,
      latitudeDelta: newDelta,
      longitudeDelta: newDelta,
    }));
  };

  const handleMapRegionChange = (region: Region) => {
    setMapRegion({
      latitude: parseFloat(region.latitude.toString()),
      longitude: parseFloat(region.longitude.toString()),
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocations(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Show initial suggestions when search field is focused
  const handleSearchFocus = async () => {
    if (searchQuery.trim().length === 0) {
      // Show popular locations and current location
      const popularLocations = getPopularLocations();
      const currentLocation = await getCurrentLocationSuggestion();

      const suggestions = currentLocation
        ? [currentLocation, ...popularLocations.slice(0, 4)]
        : popularLocations.slice(0, 5);

      setSearchResults(suggestions);
      setShowSearchResults(true);
    }
  };

  const handleLocationSelect = (location: any) => {
    const newRegion: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setMapRegion(newRegion);
    setSearchQuery(location.name || location.address);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Debounce timer reference
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length >= 2) {
      // Debounce search - only search after user stops typing for 500ms
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(text);
      }, 500);
    } else if (text.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSaveAndContinue = async () => {
    // Get user's real current location and save to userData
    try {
      const realLocation = await requestUserLocation();
      if (realLocation) {
        updateUserData({
          lat: realLocation.latitude,
          lng: realLocation.longitude,
        });
        router.push("/auth/add_photos");
      } else {
        showToast("Unable to get your location. Please try again.", "error");
      }
    } catch (error) {
      showToast("Unable to get your location. Please try again.", "error");
    }
  };

  const handleSaveChanges = async () => {
    if (!user?.user_id) {
      Alert.alert(t("common.error"), t("common.userSessionExpired"));
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      const location = await Location.reverseGeocodeAsync({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      });
      const address = location[0]
        ? `${location[0].street || ""} ${location[0].city || ""} ${
            location[0].region || ""
          }`.trim()
        : "Private Spot";

      if (existingSpotData?.id) {
        // Update existing private spot
        formData.append("type", "update_data");
        formData.append("user_id", user.user_id);
        formData.append("table_name", "private_spots");
        formData.append("lat", mapRegion.latitude.toString());
        formData.append("lng", mapRegion.longitude.toString());
        formData.append("address", address);
        formData.append(
          "radius",
          (selectedRadius === "100m" ? 100 : 200).toString()
        );
        formData.append("id", existingSpotData.id);
      } else {
        // Add new private spot
        formData.append("type", "add_data");
        formData.append("table_name", "private_spots");
        formData.append("user_id", user.user_id);
        formData.append("address", address);
        formData.append(
          "radius",
          (selectedRadius === "100m" ? 100 : 200).toString()
        );
        formData.append("lat", mapRegion.latitude.toString());
        formData.append("lng", mapRegion.longitude.toString());
      }

      const response = await apiCall(formData);

      if (response.result) {
        setTimeout(() => {
          if (isEdit) {
            router.back();
          } else {
            handleSaveAndContinue();
          }
        }, 500);
      } else {
        throw new Error(response.message || t("common.failedToCreateProfile"));
      }
    } catch (error) {
      showToast(
        existingSpotData?.id
          ? t("common.failedToUpdateNotifications")
          : t("common.failedToCreateProfile"),
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getRadiusInMeters = () => {
    return selectedRadius === "100m" ? 100 : 200;
  };

  const getTitle = () => {
    if (existingSpotData?.id) {
      return t("common.editPrivateSpot");
    } else if (isEdit) {
      return t("common.editYourPrivateSpot");
    } else {
      return t("common.setYourPrivateSpot");
    }
  };

  const getSubtitle = () => {
    if (existingSpotData?.id) {
      return t("common.updatePrivateSpotDesc");
    } else if (isEdit) {
      return t("common.updatePrivateAreaDesc");
    } else if (locationPermissionGranted) {
      return t("common.setPrivateAreaDesc");
    } else {
      return t("common.choosePrivateAreaDesc");
    }
  };

  const getButtonTitle = () => {
    if (isSaving) {
      return existingSpotData?.id
        ? t("common.updating")
        : isEdit
        ? t("common.saving")
        : t("common.saving");
    } else if (existingSpotData?.id) {
      return t("common.updateSpot");
    } else if (isEdit) {
      return t("common.saveChanges");
    } else {
      return t("common.continue");
    }
  };

  const handleButtonPress = () => {
    // if (existingSpotData?.id || isEdit) {
    handleSaveChanges();
    // } else {
    //   handleSaveAndContinue();
    // }
  };

  if (isLoadingLocation && !isEdit && !existingSpotData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <Text style={styles.loadingText}>{t("common.gettingLocation")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{getTitle()}</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} />{" "}
              {getSubtitle()}
            </Text>
          </View>
        </View>

        {/* Search Field */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={color.gray55}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t("common.searchLocation")}
              placeholderTextColor={color.gray55}
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              onFocus={handleSearchFocus}
            />
            {isSearching && (
              <ActivityIndicator
                size="small"
                color={color.primary}
                style={styles.searchLoading}
              />
            )}
          </View>

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) =>
                  `${item.latitude}-${item.longitude}-${index}`
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleLocationSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        item.type === "recent"
                          ? "time-outline"
                          : item.type === "popular"
                          ? "star-outline"
                          : "location-outline"
                      }
                      size={20}
                      color={
                        item.type === "recent"
                          ? color.primary
                          : item.type === "popular"
                          ? "#FFA500"
                          : color.gray55
                      }
                    />
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>
                        {item.name || item.address}
                      </Text>
                      {item.address && item.name && (
                        <Text
                          style={styles.searchResultSubtitle}
                          numberOfLines={1}
                        >
                          {item.address}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {showSearchResults &&
            searchResults.length === 0 &&
            searchQuery.trim() &&
            !isSearching && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  {t("common.noResultsFound")}
                </Text>
              </View>
            )}
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={handleMapRegionChange}
            showsUserLocation={
              locationPermissionGranted && !isEdit && !existingSpotData
            }
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {/* Privacy Circle - always centered on current map region */}
            <Circle
              center={{
                latitude: parseFloat(mapRegion.latitude.toString()),
                longitude: parseFloat(mapRegion.longitude.toString()),
              }}
              radius={getRadiusInMeters()}
              fillColor="rgba(99, 179, 206, 0.2)"
              strokeColor={color.primary}
              strokeWidth={2}
            />

            {/* Center Marker - always at map center */}
            <Marker
              coordinate={{
                latitude: parseFloat(mapRegion.latitude.toString()),
                longitude: parseFloat(mapRegion.longitude.toString()),
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <MarkerIcon />
            </Marker>
          </MapView>
        </View>

        <View style={styles.radiusSection}>
          <Text style={styles.radiusTitle}>{t("common.privacyRadius")}</Text>
          <View style={styles.radiusButtons}>
            <TouchableOpacity
              style={[
                styles.radiusButton,
                selectedRadius === "100m"
                  ? styles.selectedRadiusButton
                  : styles.unselectedRadiusButton,
              ]}
              onPress={() => handleRadiusSelect("100m")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  selectedRadius === "100m"
                    ? styles.selectedRadiusText
                    : styles.unselectedRadiusText,
                ]}
              >
                100m
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radiusButton,
                selectedRadius === "200m"
                  ? styles.selectedRadiusButton
                  : styles.unselectedRadiusButton,
              ]}
              onPress={() => handleRadiusSelect("200m")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  selectedRadius === "200m"
                    ? styles.selectedRadiusText
                    : styles.unselectedRadiusText,
                ]}
              >
                200m
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!locationPermissionGranted && !isEdit && !existingSpotData && (
          <View style={styles.retryContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={getUserLocation}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>
                {t("common.enableLocationAccess")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={getButtonTitle()}
          onPress={handleButtonPress}
          isDisabled={isSaving}
          isLoading={isSaving}
        />
      </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
  },
  titleSection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  title: {
    paddingTop: 40,
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  centerIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -10 }],
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairHorizontal: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: color.primary,
    opacity: 0.8,
  },
  crosshairVertical: {
    position: "absolute",
    width: 2,
    height: 20,
    backgroundColor: color.primary,
    opacity: 0.8,
  },
  radiusSection: {
    padding: 24,
  },
  radiusTitle: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray700,
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: "row",
    gap: 16,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadiusButton: {
    backgroundColor: color.gray95,
    borderColor: color.primary,
  },
  unselectedRadiusButton: {
    backgroundColor: color.white,
    borderColor: color.gray87,
  },
  radiusButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
  },
  selectedRadiusText: {
    color: color.primary,
  },
  unselectedRadiusText: {
    color: color.black,
  },
  retryContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  retryButton: {
    backgroundColor: color.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: color.white,
    fontSize: 16,
    fontFamily: font.medium,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: color.gray87,
  },
  // Search styles
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    position: "relative",
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray95,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: color.gray87,
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
  searchLoading: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    position: "absolute",
    top: "100%",
    left: 16,
    right: 16,
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.gray95,
  },
  searchResultText: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  noResultsContainer: {
    position: "absolute",
    top: "100%",
    left: 16,
    right: 16,
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray87,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
  },
});
