import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store, PlusCircle, UserCheck } from 'lucide-react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Pixel ve modern cihazlarda alttaki beyaz jest çubuğuna (gesture bar / home indicator)
  // değmemesi için dinamik güvenli alt boşluk:
  const bottomInset = insets.bottom > 0 ? insets.bottom + 6 : (Platform.OS === 'android' ? 24 : 12);
  const tabHeight = 52 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#15803d', // Zümrüt Yeşili
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tarladan Vitrin',
          tabBarIcon: ({ color, size }) => <Store size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-listing"
        options={{
          title: 'İlan Ver',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil & İlanlarım',
          tabBarIcon: ({ color, size }) => <UserCheck size={size ?? 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
