import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

export interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: 'search' | 'recent' | 'popular';
}

export async function requestUserLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

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

    // Enhanced results with better location names
    const enhancedResults = await Promise.all(
      results.map(async (location, index) => {
        try {
          // Get a more detailed address using reverse geocoding
          const reverseResults = await Location.reverseGeocodeAsync({
            latitude: location.latitude,
            longitude: location.longitude,
          });

          let locationName = query;
          let address = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;

          if (reverseResults.length > 0) {
            const reverseLocation = reverseResults[0];
            
            // Create a more meaningful name
            const street = reverseLocation.street || '';
            const city = reverseLocation.city || '';
            const region = reverseLocation.region || '';
            const country = reverseLocation.country || '';
            
            // Use street name as primary name if available
            if (street) {
              locationName = street;
              address = `${city ? city + ', ' : ''}${region ? region + ', ' : ''}${country}`.replace(/,\s*$/, '');
            } else if (city) {
              locationName = city;
              address = `${region ? region + ', ' : ''}${country}`.replace(/,\s*$/, '');
            } else {
              locationName = query;
              address = `${region ? region + ', ' : ''}${country}`.replace(/,\s*$/, '');
            }
          }

          return {
            id: `location_${index}`,
            name: locationName,
            address: address,
            latitude: location.latitude,
            longitude: location.longitude,
          };
        } catch (reverseError) {
          console.error("Error getting reverse geocode:", reverseError);
          // Fallback to basic result
          return {
            id: `location_${index}`,
            name: query,
            address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
            latitude: location.latitude,
            longitude: location.longitude,
          };
        }
      })
    );

    return enhancedResults;
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

// Get popular/common locations for suggestions
export function getPopularLocations(): LocationSuggestion[] {
  // You can customize these based on your app's target audience
  return [
    {
      id: 'popular_1',
      name: 'Central Park',
      address: 'New York, NY, USA',
      latitude: 40.7829,
      longitude: -73.9654,
      type: 'popular'
    },
    {
      id: 'popular_2',
      name: 'Times Square',
      address: 'New York, NY, USA',
      latitude: 40.7580,
      longitude: -73.9855,
      type: 'popular'
    },
    {
      id: 'popular_3',
      name: 'Golden Gate Bridge',
      address: 'San Francisco, CA, USA',
      latitude: 37.8199,
      longitude: -122.4783,
      type: 'popular'
    },
    {
      id: 'popular_4',
      name: 'Eiffel Tower',
      address: 'Paris, France',
      latitude: 48.8584,
      longitude: 2.2945,
      type: 'popular'
    },
    {
      id: 'popular_5',
      name: 'Big Ben',
      address: 'London, UK',
      latitude: 51.4994,
      longitude: -0.1245,
      type: 'popular'
    }
  ];
}

// Get user's current location as a suggestion
export async function getCurrentLocationSuggestion(): Promise<LocationSuggestion | null> {
  try {
    const location = await requestUserLocation();
    if (!location) return null;

    const address = await reverseGeocodeLocation(location.latitude, location.longitude);
    
    return {
      id: 'current_location',
      name: 'Current Location',
      address: address,
      latitude: location.latitude,
      longitude: location.longitude,
      type: 'recent'
    };
  } catch (error) {
    console.error("Error getting current location suggestion:", error);
    return null;
  }
}
