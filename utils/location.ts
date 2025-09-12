import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

export interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export async function requestUserLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log("status", status);

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Location access is required to use this feature. Please enable it in settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings(); // Android
              }
            },
          },
        ]
      );
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (err) {
    console.error("Error requesting location:", err);
    return null;
  }
}

export async function searchLocations(
  query: string
): Promise<LocationSuggestion[]> {
  try {
    if (!query.trim()) return [];

    const results = await Location.geocodeAsync(query);

    return results.map((location, index) => ({
      id: `location_${index}`,
      name: query,
      address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(
        6
      )}`,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
}

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length > 0) {
      const location = results[0];
      return (
        `${location.street || ""} ${location.city || ""} ${
          location.region || ""
        }`.trim() || "Unknown Location"
      );
    }

    return "Unknown Location";
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "Unknown Location";
  }
}
