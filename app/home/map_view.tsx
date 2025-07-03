import { color } from "@/utils/constants";
import { MarkerIcon } from "@/utils/SvgIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const nearbyUsers = [
    {
      id: "1",
      name: "Alex",
      age: 25,
      coordinate: {
        latitude: 45.431457,
        longitude: 12.320171,
      },
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Sam",
      age: 28,
      coordinate: {
        latitude: 45.431859,
        longitude: 12.312867,
      },
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Julia",
      age: 24,
      coordinate: {
        latitude: 45.446474,
        longitude: 12.31835,
      },
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "4",
      name: "Mike",
      age: 30,
      coordinate: {
        latitude: 45.442625,
        longitude: 12.30952,
      },
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "5",
      name: "Emma",
      age: 26,
      coordinate: {
        latitude: 45.4388474,
        longitude: 12.3175151,
      },
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
    },
  ];

  const [mapRegion] = useState({
    latitude: 45.4408474,
    longitude: 12.3155151,
  });

  const handleUserProfile = (user: any) => {
    console.log("first");
    router.push("/profile/user_profile");
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: 45.4408474,
          longitude: 12.3155151,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={user.coordinate}
            onPress={() => handleUserProfile(user)}
          >
            <View style={styles.userMarker}>
              <Image source={{ uri: user.image }} style={styles.userImage} />
            </View>
          </Marker>
        ))}
        <Marker
          coordinate={{
            latitude: mapRegion.latitude,
            longitude: mapRegion.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          {/* <View style={styles.customMarker}>
                <View style={styles.markerInner} />
              </View> */}
          <MarkerIcon />
        </Marker>
      </MapView>
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
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#E8F4FD",
    position: "relative",
  },
  userMarker: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: color.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userImage: {
    width: "100%",
    height: "100%",
  },
});
