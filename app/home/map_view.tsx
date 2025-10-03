import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { MarkerIcon } from "@/utils/SvgIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

interface MapViewProps {
  onUserPress: (user: any) => void;
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  users: any[];
  loading: boolean;
  error: string | null;
  refetch?: any;
  selectedUser?: any;
  onUserDeselect?: () => void;
  onShowMyLocation?: () => void; // NEW: Show my location handler
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function Map({
  onUserPress,
  currentLocation,
  users,
  loading,
  error,
  refetch,
  selectedUser,
  onUserDeselect,
  onShowMyLocation, // NEW: Prop for showing current user location
}: MapViewProps) {
  const { userData } = useAppContext();
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  // Get user's current location
  useEffect(() => {
    const getLocationForMap = () => {
      if (currentLocation) {
        return currentLocation;
      } else if (userData?.lat && userData?.lng) {
        return {
          latitude: parseFloat(userData.lat.toString()),
          longitude: parseFloat(userData.lng.toString()),
        };
      }
      return null;
    };

    const locationForMap = getLocationForMap();

    if (locationForMap) {
      const newRegion = {
        latitude: locationForMap.latitude,
        longitude: locationForMap.longitude,
        latitudeDelta: 0.01, // UPDATED: Slightly wider view for better context
        longitudeDelta: 0.01,
      };

      setMapRegion(newRegion);
      setLocationLoading(false);
    } else {
      setLocationLoading(true);
    }
  }, [currentLocation, userData?.lat, userData?.lng]);

  // ENHANCED: Better animation to selected user location
  useEffect(() => {
    if (selectedUser && mapRef.current) {
      const userLocation = getUserCoordinates(selectedUser);

      if (userLocation) {
        // Create region for selected user with appropriate zoom level
        const selectedUserRegion = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.003, // UPDATED: Closer zoom for better focus
          longitudeDelta: 0.003,
        };

        // Animate to the selected user's location with longer duration for smoother animation
        mapRef.current.animateToRegion(selectedUserRegion, 1500);
      }
    }
  }, [selectedUser]);

  // NEW: Handle showing current user location
  const handleShowMyLocation = () => {
    if (currentLocation && mapRef.current) {
      const currentUserRegion = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01, // Slightly wider view for current location
        longitudeDelta: 0.01,
      };

      mapRef.current.animateToRegion(currentUserRegion, 1000);

      // Call the parent handler if provided
      if (onShowMyLocation) {
        onShowMyLocation();
      }
    }
  };

  // ENHANCED: Helper function to get coordinates from user object with better error handling
  const getUserCoordinates = (user: any) => {
    // Try actualLocation first (preferred)
    if (user?.actualLocation?.lat && user?.actualLocation?.lng) {
      const lat = parseFloat(user.actualLocation.lat.toString());
      const lng = parseFloat(user.actualLocation.lng.toString());

      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Fallback to loc object
    if (user?.loc?.lat && user?.loc?.lng) {
      const lat = parseFloat(user.loc.lat.toString());
      const lng = parseFloat(user.loc.lng.toString());

      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Fallback to direct lat/lng properties (for users without loc object)
    if (user?.lat && user?.lng) {
      const lat = parseFloat(user.lat.toString());
      const lng = parseFloat(user.lng.toString());

      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }

    return null;
  };

  // Filter users that have valid coordinates
  const usersWithLocation = users.filter((user) => {
    const coords = getUserCoordinates(user);
    return coords && coords.latitude !== 0 && coords.longitude !== 0;
  });

  // Get the location to display
  const displayLocation =
    currentLocation ||
    (userData?.lat && userData?.lng
      ? {
          latitude: parseFloat(userData.lat.toString()),
          longitude: parseFloat(userData.lng.toString()),
        }
      : null);

  // Loading state
  if (locationLoading || !mapRegion || !displayLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Error state when no location available
  if (!currentLocation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorTitle}>Location Unavailable</Text>
        <Text style={styles.errorMessage}>
          Unable to access your location. Please enable location services and
          try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        style={styles.map}
        region={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false} // UPDATED: We'll use custom button
        showsCompass={false}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor={color.primary}
        loadingBackgroundColor={color.white}
        onPress={onUserDeselect}
        // UPDATED: Better map styling
        mapType="standard"
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={false}
        showsScale={false}
      >
        {/* Current user location marker */}
        <Marker
          coordinate={currentLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          identifier="current-user"
          title="You are here"
          description="Your current location"
        >
          <MarkerIcon />
        </Marker>

        {/* Other users markers */}
        {usersWithLocation.map((mapUser) => {
          const userCoords = getUserCoordinates(mapUser);
          if (!userCoords) return null;

          const isSelected = selectedUser?.id === mapUser.id;

          return (
            <Marker
              key={`user-${mapUser.id}`}
              coordinate={userCoords}
              onPress={() => onUserPress(mapUser)}
              identifier={`user-${mapUser.id}`}
              tracksViewChanges={false} // UPDATED: Better performance
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: -5 }}
              title={
                mapUser.name
                  ? `${mapUser.name}, ${mapUser.age || "N/A"}`
                  : "User"
              }
              description={isSelected ? "Selected user" : undefined}
            >
              <View
                style={[
                  styles.userMarker,
                  isSelected && styles.selectedUserMarker,
                ]}
                pointerEvents="box-none"
              >
                <Image
                  source={{
                    uri:
                      mapUser.images?.[0] ||
                      "https://via.placeholder.com/60x60.png?text=User",
                  }}
                  style={[
                    styles.userImage,
                    isSelected && styles.selectedUserImage,
                  ]}
                  defaultSource={{
                    uri: "https://via.placeholder.com/60x60.png?text=User",
                  }}
                />
                {/* ENHANCED: Better selection indicator */}
                {isSelected && (
                  <>
                    <View style={styles.selectionRing} />
                    <View style={styles.selectionPulse} />
                  </>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* NEW: Custom My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleShowMyLocation}
        activeOpacity={0.8}
      >
        <MaterialIcons name="my-location" size={24} color={color.primary} />
      </TouchableOpacity>

      {/* Users loading indicator */}
      {/* {loading && (
        <View style={styles.usersLoadingContainer}>
          <ActivityIndicator size="small" color={color.primary} />
          <Text style={styles.usersLoadingText}>Loading users...</Text>
        </View>
      )} */}

      {/* Error indicator for users data */}
      {/* {error && !loading && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ⚠️ Unable to load users nearby
          </Text>
        </View>
      )} */}

      {/* No users indicator */}
      {/* {!loading && !error && usersWithLocation.length === 0 && (
        <View style={styles.noUsersContainer}>
          <Text style={styles.noUsersText}>No users found in your area</Text>
        </View>
      )} */}

      {/* NEW: Selected user info card */}
      {/* {selectedUser && (
        <View style={styles.selectedUserCard}>
          <View style={styles.selectedUserInfo}>
            <Image
              source={{
                uri:
                  selectedUser.images?.[0] ||
                  "https://via.placeholder.com/40x40.png?text=U",
              }}
              style={styles.selectedUserAvatar}
            />
            <View style={styles.selectedUserDetails}>
              <Text style={styles.selectedUserName}>
                {selectedUser.name || "Unknown"}, {selectedUser.age || "N/A"}
              </Text>
              <Text style={styles.selectedUserNote}>Selected on map</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onUserDeselect} style={styles.closeButton}>
            <MaterialIcons name="close" size={20} color={color.gray55} />
          </TouchableOpacity>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
  },
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F8F9FA",
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 22,
  },
  // User markers
  userMarker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: color.white,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedUserMarker: {
    borderColor: color.primary,
    borderWidth: 3,
    transform: [{ scale: 1.2 }], // UPDATED: Scale up selected marker
  },
  userImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  selectedUserImage: {
    // Additional styling for selected user image if needed
  },
  // ENHANCED: Better selection indicators
  selectionRing: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: color.primary,
    opacity: 0.8,
  },
  selectionPulse: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: color.primary,
    opacity: 0.4,
  },
  // NEW: My Location Button
  myLocationButton: {
    position: "absolute",
    bottom: 140, // UPDATED: Position above potential selected user card
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  // Users loading overlay
  usersLoadingContainer: {
    position: "absolute",
    top: 80, // UPDATED: Position below header
    left: 20,
    right: 20,
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  usersLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  // Error banner
  errorBanner: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: "#FFEAA7",
    borderWidth: 1,
  },
  errorBannerText: {
    color: "#856404",
    fontSize: 14,
    fontFamily: font.medium,
    textAlign: "center",
  },
  // No users indicator
  noUsersContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  noUsersText: {
    color: color.gray55,
    fontSize: 14,
    fontFamily: font.regular,
    textAlign: "center",
  },
  // NEW: Selected user card
  selectedUserCard: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: color.primary + "20", // 20% opacity
  },
  selectedUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: color.primary,
  },
  selectedUserDetails: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 2,
  },
  selectedUserNote: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.gray94,
    alignItems: "center",
    justifyContent: "center",
  },
});
