import UserCard from "@/components/user_card";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";

export default function ListView({ onViewProfile, onBookmark }: any) {
  // Sample users data - replace with your actual data
  const users = [
    {
      id: "1",
      name: "Alex",
      age: 25,
      distance: "0.5 km",
      isOnline: true,
      lookingFor: "Serious relationship",
      interests: ["Coffee", "Hiking", "Photography"],
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Sam",
      age: 28,
      distance: "1.2 km",
      isOnline: false,
      lookingFor: "Casual dating",
      interests: ["Food", "Wine", "Writing"],
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "Julia",
      age: 24,
      distance: "2.1 km",
      isOnline: true,
      lookingFor: "Friendship",
      interests: ["Reading", "Art", "Yoga"],
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "4",
      name: "Mike",
      age: 30,
      distance: "3.5 km",
      isOnline: false,
      lookingFor: "Open to possibilities",
      interests: ["Fitness", "Travel", "Music"],
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face",
    },
    {
      id: "5",
      name: "Emma",
      age: 26,
      distance: "4.2 km",
      isOnline: true,
      lookingFor: "Serious relationship",
      interests: ["Cooking", "Dancing", "Movies"],
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
    },
  ];

  const renderUserCard = ({ item }: any) => (
    <UserCard
      user={item}
      onViewProfile={onViewProfile}
      onBookmark={onBookmark}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listContainer: {
    paddingVertical: 10,
  },
});
