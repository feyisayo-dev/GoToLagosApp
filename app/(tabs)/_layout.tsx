import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Define the brand colors locally to ensure they match perfectly
const COLORS = {
  primary: '#0B9B4D',    // TransitFlow Green
  inactive: '#8E8E93',   // iOS Standard Grey
  background: '#FFFFFF',
  border: '#E0E0E0',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        headerShown: false,
        tabBarButton: HapticTab,
        // Add specific styling for a modern, clean look
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute', // Transparent background effect on iOS
            borderTopWidth: 0,
            elevation: 0,
          },
          default: {
            backgroundColor: COLORS.background,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            elevation: 0, // Remove shadow on Android for a flat, clean look
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }),
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}