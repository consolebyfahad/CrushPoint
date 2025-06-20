import { color } from "@/utils/constants";
import { router } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

export default function Map({ onUserPress }: any) {
  const nearbyUsers = [
    {
      id: "1",
      name: "Alex",
      age: 25,
      coordinate: {
        latitude: 45.4408474,
        longitude: 12.3155151,
      },
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Sam",
      age: 28,
      coordinate: {
        latitude: 45.4420474,
        longitude: 12.3165151,
      },
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Julia",
      age: 24,
      coordinate: {
        latitude: 45.4398474,
        longitude: 12.3145151,
      },
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "4",
      name: "Mike",
      age: 30,
      coordinate: {
        latitude: 45.4418474,
        longitude: 12.3135151,
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

  const handleUserProfile = (user: any) => {
    if (onUserPress) {
      onUserPress(user);
      router.push("/profile/user_profile");
    } else {
      console.log("User pressed:", user.name);
    }
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
        showsUserLocation={false}
        showsMyLocationButton={false}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Circle
          center={{
            latitude: 45.4408474,
            longitude: 12.3155151,
          }}
          radius={500}
          fillColor="rgba(99, 179, 206, 0.3)"
          strokeColor={color.primary}
          strokeWidth={2}
        />

        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={user.coordinate}
            onPress={() => handleUserProfile(user)}
          >
            <TouchableOpacity style={styles.userMarker} activeOpacity={0.8}>
              <Image source={{ uri: user.image }} style={styles.userImage} />
            </TouchableOpacity>
          </Marker>
        ))}
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
