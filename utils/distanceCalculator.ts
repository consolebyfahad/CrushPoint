interface UserLocation {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param userLocation Current user's location
 * @param targetLocation Target user's location
 * @returns Distance in kilometers as formatted string
 */
export const calculateDistance = (
  userLocation: UserLocation,
  targetLocation: UserLocation
): string => {
  // Check if both locations are valid
  if (
    !userLocation?.lat ||
    !userLocation?.lng ||
    !targetLocation?.lat ||
    !targetLocation?.lng
  ) {
    return "N/A";
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(targetLocation.lat - userLocation.lat);
  const dLng = toRadians(targetLocation.lng - userLocation.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userLocation.lat)) *
      Math.cos(toRadians(targetLocation.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Format distance
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

/**
 * Convert degrees to radians
 * @param degrees Degrees to convert
 * @returns Radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate distance between two coordinates in meters
 * @param location1 First location
 * @param location2 Second location
 * @returns Distance in meters
 */
export const calculateDistanceInMeters = (
  location1: UserLocation,
  location2: UserLocation
): number => {
  if (
    !location1?.lat ||
    !location1?.lng ||
    !location2?.lat ||
    !location2?.lng
  ) {
    return Infinity;
  }

  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(location2.lat - location1.lat);
  const dLng = toRadians(location2.lng - location1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(location1.lat)) *
      Math.cos(toRadians(location2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a location is within a private spot radius
 * @param userLocation User's current location
 * @param privateSpot Private spot with lat, lng, and radius
 * @returns True if user is within the private spot radius
 */
export const isLocationInPrivateSpot = (
  userLocation: UserLocation,
  privateSpot: { lat: number; lng: number; radius: number }
): boolean => {
  if (!userLocation?.lat || !userLocation?.lng) {
    return false;
  }

  if (!privateSpot?.lat || !privateSpot?.lng || !privateSpot?.radius) {
    return false;
  }

  const distance = calculateDistanceInMeters(userLocation, {
    lat: privateSpot.lat,
    lng: privateSpot.lng,
  });

  // Convert radius from string/number to meters (assuming radius is in meters)
  const radiusInMeters =
    typeof privateSpot.radius === "string"
      ? parseInt(privateSpot.radius)
      : privateSpot.radius;

  return distance <= radiusInMeters;
};

/**
 * Check if a user is in any of their private spots
 * @param userLocation User's current location
 * @param privateSpots Array of private spots
 * @returns True if user is within any private spot
 */
export const isUserInPrivateSpot = (
  userLocation: UserLocation,
  privateSpots: Array<{ lat: number | string; lng: number | string; radius: number | string }>
): boolean => {
  if (!userLocation?.lat || !userLocation?.lng || !privateSpots || privateSpots.length === 0) {
    return false;
  }

  return privateSpots.some((spot) => {
    const spotLat = typeof spot.lat === "string" ? parseFloat(spot.lat) : spot.lat;
    const spotLng = typeof spot.lng === "string" ? parseFloat(spot.lng) : spot.lng;
    const spotRadius = typeof spot.radius === "string" ? parseInt(spot.radius) : spot.radius;

    if (isNaN(spotLat) || isNaN(spotLng) || isNaN(spotRadius)) {
      return false;
    }

    return isLocationInPrivateSpot(userLocation, {
      lat: spotLat,
      lng: spotLng,
      radius: spotRadius,
    });
  });
};
