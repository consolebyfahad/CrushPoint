import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { requestUserLocation } from "@/utils/location";
import { MarkerIcon } from "@/utils/SvgIcons";
import Octicons from "@expo/vector-icons/Octicons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
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
      Alert.alert("Error", "User session expired. Please login again.");
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
        throw new Error(response.message || "Failed to save private spot");
      }
    } catch (error) {
      showToast(
        existingSpotData?.id
          ? "Failed to update private spot. Please try again."
          : "Failed to add private spot. Please try again.",
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
      return "Edit Private Spot";
    } else if (isEdit) {
      return "Edit Your Private Spot";
    } else {
      return "Set Your Private Spot";
    }
  };

  const getSubtitle = () => {
    if (existingSpotData?.id) {
      return "Update this private spot location and radius";
    } else if (isEdit) {
      return "Update the area where you don't want to be visible to others";
    } else if (locationPermissionGranted) {
      return "Drag the map to choose an area where you don't want to be visible to others, \nYou can add up to 3 Private Spots in profile setting.";
    } else {
      return "Choose an area on the map where you don't want to be visible to others";
    }
  };

  const getButtonTitle = () => {
    if (isSaving) {
      return existingSpotData?.id
        ? "Updating..."
        : isEdit
        ? "Saving..."
        : "Saving...";
    } else if (existingSpotData?.id) {
      return "Update Spot";
    } else if (isEdit) {
      return "Save Changes";
    } else {
      return "Continue";
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
          <Text style={styles.loadingText}>Getting your location...</Text>
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
          <Text style={styles.radiusTitle}>Privacy Radius</Text>
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
              <Text style={styles.retryButtonText}>Enable Location Access</Text>
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
});
