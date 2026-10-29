import { Tabs } from "expo-router";
import { House, Info, Newspaper, Search } from "lucide-react-native";
import { View } from "react-native";

const PURPLE = "#A78BFA";
const MUTED = "#AAA3C2";
const BAR = "#1D1833";
const BORDER = "#332A4B";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: MUTED,
        tabBarShowLabel: true,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 3,
        },
        tabBarStyle: {
          height: 68,
          paddingTop: 7,
          paddingBottom: 7,
          backgroundColor: BAR,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: BORDER,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          marginTop: 1,
        },
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: BAR,
              borderRadius: 23,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 46,
                height: 29,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <House color={color} size={21} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 46,
                height: 29,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Newspaper
                color={color}
                size={21}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 46,
                height: 29,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search color={color} size={21} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 46,
                height: 29,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info color={color} size={21} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
