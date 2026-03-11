import { useAppContext } from "@/context/app_context";
import { color, font } from "@/utils/constants";
import { isUserInPrivateSpot } from "@/utils/distanceCalculator";
import { MarkerIcon } from "@/utils/SvgIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  onShowMyLocation?: () => void;
  onRetryLocation?: () => void;
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
  onShowMyLocation,
  onRetryLocation,
}: MapViewProps) {
  const { t } = useTranslation();
  const { userData } = useAppContext();
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationGaveUp, setLocationGaveUp] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const getLocationForMap = () => {
      if (currentLocation) {
        return currentLocation;
      }
      if (userData?.lat != null && userData?.lng != null) {
        const lat = parseFloat(userData.lat.toString());
        const lng = parseFloat(userData.lng.toString());
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          return { latitude: lat, longitude: lng };
        }
      }
      return null;
    };

    const locationForMap = getLocationForMap();

    if (locationForMap) {
      setLocationGaveUp(false);
      setMapRegion({
        latitude: locationForMap.latitude,
        longitude: locationForMap.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLocationLoading(false);
    } else {
      setLocationLoading(true);
    }
  }, [currentLocation, userData?.lat, userData?.lng]);

  const hasLocation =
    currentLocation || (userData?.lat != null && userData?.lng != null);
  useEffect(() => {
    if (Platform.OS !== "android" || hasLocation) return;
    const timer = setTimeout(() => setLocationGaveUp(true), 4000);
    return () => clearTimeout(timer);
  }, [hasLocation]);

  useEffect(() => {
    if (selectedUser && mapRef.current) {
      const userLocation = getUserCoordinates(selectedUser);

      if (userLocation) {
        const selectedUserRegion = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        };

        mapRef.current.animateToRegion(selectedUserRegion, 1500);
      }
    }
  }, [selectedUser]);

  const handleShowMyLocation = () => {
    const location =
      currentLocation ||
      (userData?.lat != null && userData?.lng != null
        ? {
            latitude: parseFloat(userData.lat.toString()),
            longitude: parseFloat(userData.lng.toString()),
          }
        : null);
    if (location && mapRef.current) {
      const currentUserRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(currentUserRegion, 1000);
      onShowMyLocation?.();
    }
  };

  const getUserCoordinates = (user: any) => {
    if (user?.actualLocation?.lat && user?.actualLocation?.lng) {
      const lat = parseFloat(user.actualLocation.lat.toString());
      const lng = parseFloat(user.actualLocation.lng.toString());

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }

    if (user?.loc?.lat && user?.loc?.lng) {
      const lat = parseFloat(user.loc.lat.toString());
      const lng = parseFloat(user.loc.lng.toString());

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }

    if (user?.lat && user?.lng) {
      const lat = parseFloat(user.lat.toString());
      const lng = parseFloat(user.lng.toString());

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }

    return null;
  };

  const usersWithLocation = users.filter((user) => {
    const coords = getUserCoordinates(user);
    if (!coords || coords.latitude === 0 || coords.longitude === 0) {
      return false;
    }

    if (
      user.private_spots &&
      Array.isArray(user.private_spots) &&
      user.private_spots.length > 0
    ) {
      const userLocation = {
        lat: coords.latitude,
        lng: coords.longitude,
      };

      const isInPrivateSpot = isUserInPrivateSpot(
        userLocation,
        user.private_spots,
      );

      if (isInPrivateSpot) {
        return false;
      }
    }

    return true;
  });

  const displayLocation =
    currentLocation ||
    (userData?.lat && userData?.lng
      ? {
          latitude: parseFloat(userData.lat.toString()),
          longitude: parseFloat(userData.lng.toString()),
        }
      : null);

  const handleRefresh = () => {
    setLocationGaveUp(false);
    setLocationLoading(true);
    onRetryLocation?.();
    refetch?.();
  };

  const stillLoading =
    !displayLocation && (locationLoading || !mapRegion) && !locationGaveUp;
  if (stillLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>{t("errors.loadingMap")}</Text>
      </View>
    );
  }

  if (!displayLocation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorTitle}>{t("errors.locationUnavailable")}</Text>
        <Text style={styles.errorMessage}>
          {t("errors.unableToAccessLocation")}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <MaterialIcons name="refresh" size={22} color={color.white} />
          <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
        </TouchableOpacity>
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
        region={mapRegion ?? undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
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
        mapType="standard"
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={false}
        showsScale={false}
      >
        {}
        <Marker
          coordinate={displayLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          identifier="current-user"
          title="You are here"
          description="Your current location"
          tracksViewChanges={false}
        >
          <MarkerIcon />
        </Marker>

        {}
        {usersWithLocation.map((mapUser) => {
          const userCoords = getUserCoordinates(mapUser);
          if (!userCoords) return null;

          const isSelected = selectedUser?.id === mapUser.id;

          const tracksChanges = Platform.OS === "android";

          return (
            <Marker
              key={`user-${mapUser.id}`}
              coordinate={userCoords}
              onPress={() => onUserPress(mapUser)}
              identifier={`user-${mapUser.id}`}
              tracksViewChanges={tracksChanges}
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: -5 }}
              zIndex={isSelected ? 1 : 0}
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
                collapsable={false}
              >
                <View style={styles.userMarkerImageWrapper}>
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
                    resizeMode="cover"
                  />
                </View>
                {}
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

      {}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleShowMyLocation}
        activeOpacity={0.8}
      >
        <MaterialIcons name="my-location" size={24} color={color.primary} />
      </TouchableOpacity>

      {}
      {}

      {}
      {}

      {}
      {}

      {}
      {}
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: color.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },

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
    transform: [{ scale: 1.2 }],
  },
  userMarkerImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  userImage: {
    width: 60,
    height: 60,
  },
  selectedUserImage: {},

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

  myLocationButton: {
    position: "absolute",
    bottom: 140,
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

  usersLoadingContainer: {
    position: "absolute",
    top: 80,
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
    borderColor: color.primary + "20",
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
