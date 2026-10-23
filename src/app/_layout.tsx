import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '@/components/SplashScreen'; // Убедись, что путь верный

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Actay-Regular': require('../../assets/fonts/Actay-Regular.otf'),
    'ActayWide-Bold': require('../../assets/fonts/ActayWide-Bold.otf'),
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await AsyncStorage.getItem('customTestData');
        await AsyncStorage.getItem('allMistakes');
      } catch (e) {
        console.error("Ошибка загрузки данных:", e);
      } finally {
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  const isReady = fontsLoaded && dataLoaded;

  return (
    <>
      <SplashScreen isReady={isReady} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#232227' },
        }}
      />
    </>
  );
}