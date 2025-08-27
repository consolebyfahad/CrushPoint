import { useAppContext } from "@/context/app_context";
import { color } from "@/utils/constants";
import { MarkerIcon } from "@/utils/SvgIcons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
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
  selectedUser?: any; // Add this prop
  onUserDeselect?: () => void; // Add this prop
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
  selectedUser, // New prop for selected user
  onUserDeselect, // New prop for deselecting user
}: MapViewProps) {
  const { userData } = useAppContext();
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const mapRef = useRef<MapView>(null); // Add map reference

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
    console.log("Location for map:", locationForMap);

    if (locationForMap) {
      const newRegion = {
        latitude: locationForMap.latitude,
        longitude: locationForMap.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };

      setMapRegion(newRegion);
      setLocationLoading(false);
    } else {
      setLocationLoading(true);
    }
  }, [currentLocation, userData?.lat, userData?.lng]);

  // NEW: Animate to selected user location
  useEffect(() => {
    if (selectedUser && mapRef.current) {
      // Get coordinates from either actualLocation or loc
      const userLocation = getUserCoordinates(selectedUser);

      if (userLocation) {
        console.log("Animating to user location:", userLocation);

        // Create region for selected user with appropriate zoom level
        const selectedUserRegion = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.005, // Zoom in closer to show the user
          longitudeDelta: 0.005,
        };

        // Animate to the selected user's location
        mapRef.current.animateToRegion(selectedUserRegion, 1000);
      }
    }
  }, [selectedUser]);

  // NEW: Helper function to get coordinates from user object
  const getUserCoordinates = (user: any) => {
    // Try actualLocation first (preferred)
    if (user?.actualLocation?.lat && user?.actualLocation?.lng) {
      return {
        latitude: parseFloat(user.actualLocation.lat.toString()),
        longitude: parseFloat(user.actualLocation.lng.toString()),
      };
    }

    // Fallback to loc object
    if (user?.loc?.lat && user?.loc?.lng) {
      return {
        latitude: parseFloat(user.loc.lat.toString()),
        longitude: parseFloat(user.loc.lng.toString()),
      };
    }

    return null;
  };

  // Filter users that have valid coordinates
  const usersWithLocation = users.filter((user) => {
    const coords = getUserCoordinates(user);
    return coords && !isNaN(coords.latitude) && !isNaN(coords.longitude);
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
        showsMyLocationButton={true}
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
      >
        {/* Current user location marker */}
        <Marker
          coordinate={currentLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          identifier="current-user"
        >
          <MarkerIcon />
        </Marker>

        {/* Other users markers */}
        {usersWithLocation.map((mapUser) => {
          const userCoords = getUserCoordinates(mapUser);
          if (!userCoords) return null;

          return (
            <Marker
              key={`user-${mapUser.id}`}
              coordinate={userCoords}
              onPress={() => onUserPress(mapUser)}
              identifier={`user-${mapUser.id}`}
              tracksViewChanges={true}
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: 0 }}
            >
              <View
                style={[
                  styles.userMarker,
                  // NEW: Highlight selected user
                  selectedUser?.id === mapUser.id && styles.selectedUserMarker,
                ]}
                pointerEvents="box-none"
              >
                <Image
                  source={{
                    uri:
                      mapUser.images?.[0] ||
                      "https://via.placeholder.com/60x60.png?text=User",
                  }}
                  style={styles.userImage}
                  defaultSource={{
                    uri: "https://via.placeholder.com/60x60.png?text=User",
                  }}
                />
                {/* NEW: Add selection indicator */}
                {selectedUser?.id === mapUser.id && (
                  <View style={styles.selectionRing} />
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Users loading indicator */}
      {loading && (
        <View style={styles.usersLoadingContainer}>
          <ActivityIndicator size="small" color={color.primary} />
          <Text style={styles.usersLoadingText}>Loading users...</Text>
        </View>
      )}

      {/* Error indicator for users data */}
      {error && !loading && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ⚠️ Unable to load users nearby
          </Text>
        </View>
      )}

      {/* No users indicator */}
      {!loading && !error && usersWithLocation.length === 0 && (
        <View style={styles.noUsersContainer}>
          <Text style={styles.noUsersText}>No users found in your area</Text>
        </View>
      )}
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
    fontWeight: "600",
    color: color.black,
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 22,
  },
  userMarker: {
    width: 38,
    height: 38,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: color.white,
    overflow: "hidden",
    position: "relative",
  },
  // NEW: Style for selected user marker
  selectedUserMarker: {
    borderColor: color.primary,
    borderWidth: 3,
  },
  userImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  // NEW: Selection ring animation
  selectionRing: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: color.primary,
    opacity: 0.6,
  },
  // Users loading overlay
  usersLoadingContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
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
    color: color.gray55,
  },
  // Error banner
  errorBanner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    right: "50%",
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: "#FFEAA7",
    borderWidth: 1,
  },
  errorBannerText: {
    color: "#856404",
    fontSize: 14,
    textAlign: "center",
  },
  // No users indicator
  noUsersContainer: {
    position: "absolute",
    bottom: 100,
    left: "50%",
    right: "50%",
    top: "50%",
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
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
    textAlign: "center",
  },
});
