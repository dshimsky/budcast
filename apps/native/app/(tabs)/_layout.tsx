import { Tabs } from "expo-router";

const tabBarStyle = {
  backgroundColor: "#070806",
  borderTopColor: "rgba(255,255,255,0.1)"
};

export default function CreatorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#b8ff3d",
        tabBarInactiveTintColor: "#a59a86",
        tabBarStyle
      }}
    >
      <Tabs.Screen name="campaigns" options={{ title: "Campaigns" }} />
      <Tabs.Screen name="work" options={{ title: "Work" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
