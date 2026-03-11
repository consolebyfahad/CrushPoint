interface UserLocation {
  lat: number;
  lng: number;
}

export const calculateDistance = (
  userLocation: UserLocation,
  targetLocation: UserLocation
): string => {
  
  if (
    !userLocation?.lat ||
    !userLocation?.lng ||
    !targetLocation?.lat ||
    !targetLocation?.lng
  ) {
    return "N/A";
  }

  const R = 6371;  
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

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

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

  const R = 6371000;  
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

  const radiusInMeters =
    typeof privateSpot.radius === "string"
      ? parseInt(privateSpot.radius)
      : privateSpot.radius;

  return distance <= radiusInMeters;
};

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
