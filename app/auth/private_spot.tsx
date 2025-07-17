import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { requestUserLocation } from "@/utils/location";
import { MarkerIcon } from "@/utils/SvgIcons";
import Octicons from "@expo/vector-icons/Octicons";
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

export default function PrivateSpot() {
  const { updateUserData, userData, user } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const isEdit = params?.fromEdit === "true";
  const paramLat = params.lat as string;
  const paramLng = params.lng as string;
  const paramRadius = params.radius as string;
  const [selectedRadius, setSelectedRadius] = useState("100m");
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 45.4408474,
    longitude: 12.3155151,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const lat = paramLat ? parseFloat(paramLat) : userData?.lat;
      const lng = paramLng ? parseFloat(paramLng) : userData?.lng;
      const radius = paramRadius ? paramRadius : userData?.radius?.toString();
      console.log(radius);
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
        const radiusValue =
          typeof radius === "string" ? radius : radius.toString();
        setSelectedRadius(radiusValue === "100" ? "100m" : "200m");
      }
    } else {
      getUserLocation();
    }
  }, [
    isEdit,
    paramLat,
    paramLng,
    paramRadius,
    userData?.lat,
    userData?.lng,
    userData?.radius,
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
        // Keep default location if permission denied
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
    setMapRegion(region);
  };

  const handleSaveAndContinue = () => {
    updateUserData({
      radius: selectedRadius === "100m" ? 100 : 200,
      lat: mapRegion.latitude,
      lng: mapRegion.longitude,
    });
    router.push("/auth/add_photos");
  };

  const handleSaveChanges = async () => {
    if (!user?.user_id) {
      Alert.alert("Error", "User session expired. Please login again.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");
      formData.append(
        "radius",
        (selectedRadius === "100m" ? 100 : 200).toString()
      );
      formData.append("lat", mapRegion.latitude.toString());
      formData.append("lng", mapRegion.longitude.toString());
      const response = await apiCall(formData);

      if (response.result) {
        // Update context with new location data
        updateUserData({
          radius: selectedRadius === "100m" ? 100 : 200,
          lat: mapRegion.latitude,
          lng: mapRegion.longitude,
        });
        showToast("Private spot updated successfully!", "success");
        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        showToast("Failed to update private spot", "error");
      }
    } catch (error) {
      showToast("Failed to update private spot. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getRadiusInMeters = () => {
    return selectedRadius === "100m" ? 100 : 200;
  };

  if (isLoadingLocation && !isEdit) {
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
          <Text style={styles.title}>
            {isEdit ? "Edit Your Private Spot" : "Set Your Private Spot"}
          </Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} />{" "}
              {isEdit
                ? "Update the area where you don't want to be visible to others"
                : locationPermissionGranted
                ? "Drag the map to choose an area where you don't want to be visible to others"
                : "Choose an area on the map where you don't want to be visible to others"}
            </Text>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={handleMapRegionChange}
            showsUserLocation={locationPermissionGranted && !isEdit}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {/* Privacy Circle - always centered on current map region */}
            <Circle
              center={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
              }}
              radius={getRadiusInMeters()}
              fillColor="rgba(99, 179, 206, 0.2)"
              strokeColor={color.primary}
              strokeWidth={2}
            />

            {/* Center Marker - always at map center */}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
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

        {!locationPermissionGranted && !isEdit && (
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
          title={isSaving ? "Saving..." : isEdit ? "Save Changes" : "Continue"}
          onPress={isEdit ? handleSaveChanges : handleSaveAndContinue}
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
