import Filters from "@/components/filters";
import Height from "@/components/height";
import ListView from "@/components/list_view";
import LookingFor from "@/components/looking_for";
import MapView from "@/components/map_view";
import Nationality from "@/components/nationality";
import Religion from "@/components/religion";
import ZodiacSign from "@/components/zodic";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  // View state
  const [viewType, setViewType] = useState("Map");

  // Modal states
  const [showFilters, setShowFilters] = useState(false);
  const [showLookingFor, setShowLookingFor] = useState(false);
  const [showHeight, setShowHeight] = useState(false);
  const [showNationality, setShowNationality] = useState(false);
  const [showReligion, setShowReligion] = useState(false);
  const [showZodiac, setShowZodiac] = useState(false);

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
  const handleViewProfile = (user: any) => {
    console.log("View profile for:", user);
    // Navigate to profile screen
    // navigation.navigate('Profile', { user });
  };

  const handleBookmark = (user: any) => {
    console.log("Bookmark user:", user);
    // Handle bookmark logic
  };

  const handleUserPress = (user: any) => {
    console.log("User pressed on map:", user);
    // Handle map user press
  };

  // Render current view content
  const renderContent = () => {
    if (viewType === "List View") {
      return (
        <ListView
          onViewProfile={handleViewProfile}
          onBookmark={handleBookmark}
        />
      );
    }

    return <MapView onUserPress={handleUserPress} />;
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      {renderContent()}

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
            onClose={() => setShowLookingFor(false)}
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
            onClose={() => setShowHeight(false)}
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
          />
        </View>
      </Modal>
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
