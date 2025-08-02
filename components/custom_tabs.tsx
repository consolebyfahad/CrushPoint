import Event from "@/assets/images/event.svg";
import ActiveEvent from "@/assets/images/focusedevent.svg";
import ActiveHome from "@/assets/images/focusedhome.svg";
import ActiveMatches from "@/assets/images/focusedmatch.svg";
import ActiveProfile from "@/assets/images/focusedprofile.svg";
import Home from "@/assets/images/home.svg";
import Matches from "@/assets/images/match.svg";
import Profile from "@/assets/images/profile.svg";
import { color } from "@/utils/constants";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { marginBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tabItem, focused && styles.activeTab]}
          >
            {route.name === "index" && (focused ? <ActiveHome /> : <Home />)}
            {route.name === "matches" &&
              (focused ? <ActiveMatches /> : <Matches />)}
            {route.name === "events" && (focused ? <ActiveEvent /> : <Event />)}
            {route.name === "profile" &&
              (focused ? <ActiveProfile /> : <Profile />)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: color.white,
    position: "absolute",
    bottom: 40,
    left: 70,
    right: 70,
    height: 64,
    borderRadius: 99,
    elevation: 10,
    shadowColor: color.gray55,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    borderRadius: 99,
    padding: 12,
    backgroundColor: color.white100,
  },
  activeTab: {
    backgroundColor: color.primary,
  },
});
