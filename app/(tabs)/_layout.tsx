import { color } from "@/utils/constants";
import {
  CalenderIcon,
  HeartIcon,
  HomeIcon,
  ProfileIcon,
} from "@/utils/SvgIcons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 40,
          left: 70,
          right: 70,
          backgroundColor: color.white,
          borderRadius: 99,
          height: 64,
          borderTopWidth: 0,
          shadowColor: color.gray300,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 10,
        },
        tabBarItemStyle: {
          flex: 1,
          borderRadius: 99,
          margin: 6,
          backgroundColor: color.white100,
        },
        tabBarActiveBackgroundColor: color.primary,
        tabBarIconStyle: {
          margin: 6,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <HomeIcon color={focused ? color.white : color.black} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarIcon: ({ focused }) => (
            <HeartIcon color={focused ? color.white : color.black} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ focused }) => (
            <CalenderIcon color={focused ? color.white : color.black} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <ProfileIcon color={focused ? color.white : color.black} />
          ),
        }}
      />
    </Tabs>
  );
}
