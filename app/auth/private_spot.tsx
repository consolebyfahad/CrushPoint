import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { color, font } from "@/utils/constants";
import { MarkerIcon } from "@/utils/SvgIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
export default function PrivateSpot() {
  const [selectedRadius, setSelectedRadius] = useState("100m");
  const [mapRegion, setMapRegion] = useState({
    latitude: 45.4408474,
    longitude: 12.3155151,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  console.log("first");
  const handleRadiusSelect = (radius) => {
    setSelectedRadius(radius);

    // Adjust map zoom based on radius
    const newDelta = radius === "100m" ? 0.005 : 0.01;
    setMapRegion((prev) => ({
      ...prev,
      latitudeDelta: newDelta,
      longitudeDelta: newDelta,
    }));
  };

  const handleMapRegionChange = (region) => {
    // Keep the same zoom level but allow map movement
    setMapRegion(region);
  };

  const handleSaveAndContinue = () => {
    console.log("Private spot location:", mapRegion);
    console.log("Privacy radius:", selectedRadius);
    router.push("/auth/add_photos"); // Update with your next route
  };

  // Calculate radius in meters for the circle
  const getRadiusInMeters = () => {
    return selectedRadius === "100m" ? 100 : 200;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Header />
          <Text style={styles.title}>Set Your Private Spot</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Octicons name="info" size={14} color={color.gray55} />{" "}
              {
                "Choose an area on the map where you don't want to be visible to others"
              }
            </Text>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={handleMapRegionChange}
            showsUserLocation={false}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Circle
              center={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
              }}
              radius={getRadiusInMeters()}
              fillColor="rgba(99, 179, 206, 0.2)"
              strokeColor={color.primary}
              strokeWidth={1}
            />

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
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton title="Save & Continue" onPress={handleSaveAndContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 500,
  },
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
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
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.gray69,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoIconText: {
    fontSize: 12,
    color: color.gray14,
    fontFamily: font.medium,
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
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: color.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.white,
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
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: color.gray87,
  },
});
