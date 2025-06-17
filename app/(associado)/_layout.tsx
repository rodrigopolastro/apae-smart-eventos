import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name='house.fill' color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name='homelogado'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name='house.fill' color={color} />,
        }}
      /> */}
      {/* <Tabs.Screen
        name='meuingresso'
        options={{
          title: 'Meus Ingressos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name='tickets.icon' color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
