import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, bindNativeQueryFocus, createBudCastQueryClient } from "@budcast/shared";
import { Stack } from "expo-router";
import { Component, type ErrorInfo, useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

class RootErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[NativeRoot] render crash", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#080a08",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text
            style={{
              color: "#fbf8f4",
              fontSize: 28,
              fontWeight: "700",
              marginBottom: 12,
            }}
          >
            Native app crashed during startup
          </Text>
          <Text
            style={{
              color: "#d7c2ab",
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            {this.state.error.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const [queryClient] = useState(() => createBudCastQueryClient());

  useEffect(() => bindNativeQueryFocus((type, listener) => AppState.addEventListener(type, listener)), []);

  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
}
