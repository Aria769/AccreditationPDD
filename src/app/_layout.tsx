import CustomAlert from "@/components/CustomAlert";
import SplashScreen from "@/components/SplashScreen";
import { setShowAlertHandler } from "@/utils/showAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Actay-Regular": require("../../assets/fonts/Actay-Regular.otf"),
    "ActayWide-Bold": require("../../assets/fonts/ActayWide-Bold.otf"),
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
  });

  useEffect(() => {
    // Устанавливаем глобальный обработчик для showAlert
    setShowAlertHandler((title, message, buttons) => {
      setAlertConfig({ title, message, buttons: buttons || [] });
      setAlertVisible(true);
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await AsyncStorage.getItem("customTestData");
        await AsyncStorage.getItem("allMistakes");
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
          contentStyle: { backgroundColor: "#232227" },
        }}
      />

      <CustomAlert
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        visible={alertVisible}
        onHide={() => setAlertVisible(false)}
      />
    </>
  );
}
