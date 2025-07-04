import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

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
