import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import { useAuthStore } from '../hooks/useAuthStore'; // 1. Importar a nova loja

useAuthStore.getState().initializeAuth();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='(associado)' options={{ headerShown: false }} />
        <Stack.Screen name='(admin)' options={{ headerShown: false }} />
        <Stack.Screen name='login' options={{ headerShown: false }} />
        <Stack.Screen name='signup' options={{ headerShown: false }} />
        <Stack.Screen name="eventdescription" options={{ headerShown: false }} />
        <Stack.Screen name="eventdescriptionlogado" options={{ headerShown: false }} />
        <Stack.Screen name="eventdescriptionadmin" options={{ headerShown: false }} />
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar style='auto' />
    </ThemeProvider>
  );
}
