import Filters from "@/components/filters";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [viewType, setViewType] = useState("Map");
  const [showFilters, setShowFilters] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 45.4408474,
    longitude: 12.3155151,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const handleNotifications = () => {
    console.log("Open notifications");
  };

  const handleFilters = () => {
    setShowFilters(true);
  };

  const closeFilters = () => {
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Map View */}
      {/* <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
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
          radius={500}
          fillColor="rgba(99, 179, 206, 0.3)"
          strokeColor={color.primary}
          strokeWidth={2}
        />

        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={user.coordinate}
            onPress={() => handleUserProfile(user)}
          >
            <TouchableOpacity style={styles.userMarker} activeOpacity={0.8}>
              <Image source={{ uri: user.image }} style={styles.userImage} />
            </TouchableOpacity>
          </Marker>
        ))}
      </MapView> */}

      {/* Top Header */}
      <SafeAreaView style={styles.topHeader}>
        <View style={styles.headerContent}>
          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotifications}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={color.black}
            />
          </TouchableOpacity>

          {/* Map/List Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewType === "Map"
                  ? styles.activeToggle
                  : styles.inactiveToggle,
              ]}
              onPress={() => setViewType("Map")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="map"
                size={18}
                color={viewType === "Map" ? color.black : color.gray400}
              />
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
                viewType === "List View"
                  ? styles.activeToggle
                  : styles.inactiveToggle,
              ]}
              onPress={() => setViewType("List View")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewType === "List View" ? color.black : color.gray400}
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
            <Ionicons name="options-outline" size={24} color={color.black} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={closeFilters}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={closeFilters}
          />
          <Filters onClose={closeFilters} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  map: {
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
    shadowColor: "#000",
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
    backgroundColor: color.white,
    borderRadius: 25,
    padding: 4,
    shadowColor: "#000",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveToggle: {
    backgroundColor: "transparent",
  },
  toggleText: {
    fontSize: 14,
    fontFamily: font.medium,
  },
  activeToggleText: {
    color: color.black,
  },
  inactiveToggleText: {
    color: color.gray400,
  },
  userMarker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: color.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userImage: {
    width: "100%",
    height: "100%",
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
