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
