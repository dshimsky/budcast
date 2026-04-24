import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "BudCast",
  slug: "budcast-native",
  scheme: "budcast",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true
  }
};

export default config;
