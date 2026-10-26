import PushButton from "@/components/PushButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import testData from "../data/tests.json";
import { showAlert } from "../utils/showAlert";

export default function ConstructorScreen() {
  const router = useRouter();

  const validateStructure = (data: any): boolean => {
    if (!data || !Array.isArray(data.subjects)) return false;

    for (const subject of data.subjects) {
      if (!subject.id || !subject.name || !Array.isArray(subject.questions)) {
        return false;
      }
    }
    return true;
  };

  const handleLoadJson = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;

      const response = await fetch(fileUri);
      const fileContent = await response.text();

      if (!fileContent || fileContent.trim() === "") {
        showAlert("Ошибка", "Файл пустой.");
        return;
      }

      const parsedNewData = JSON.parse(fileContent);

      if (!validateStructure(parsedNewData)) {
        showAlert("Ошибка", "Неверный формат JSON файла. Проверьте структуру.");
        return;
      }

      const storedData = await AsyncStorage.getItem("customTestData");
      let currentSubjects = storedData
        ? JSON.parse(storedData).subjects
        : testData.subjects;

      const newSubjects = parsedNewData.subjects;
      const existingIds = new Set(currentSubjects.map((s) => s.id));
      const uniqueNewSubjects = newSubjects.filter(
        (s) => !existingIds.has(s.id),
      );

      if (uniqueNewSubjects.length === 0) {
        showAlert(
          "Информация",
          "Все предметы из этого файла уже есть в списке.",
        );
        return;
      }

      const mergedSubjects = [...currentSubjects, ...uniqueNewSubjects];
      const finalData = { subjects: mergedSubjects };

      await AsyncStorage.setItem("customTestData", JSON.stringify(finalData));

      showAlert("Успех", `Добавлено предметов: ${uniqueNewSubjects.length}`);
    } catch (error: any) {
      console.error("Full error:", error);

      if (error.message?.includes("JSON")) {
        showAlert(
          "Ошибка формата",
          "Файл содержит невалидный JSON. Проверьте синтаксис.",
        );
      } else {
        showAlert(
          "Ошибка",
          "Не удалось загрузить файл. Убедитесь, что файл корректный.",
        );
      }
    }
  };

  const handleResetCache = async () => {
    showAlert(
      "Сброс кэша",
      "Это удалит все загруженные предметы и ошибки. Продолжить?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("customTestData");
            await AsyncStorage.removeItem("allMistakes");
            await AsyncStorage.removeItem("mistakes");
            showAlert("Готово", "Кэш очищен. Перезагрузите приложение.");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cross}>
        <PushButton
          image={require("../media/crossSign.png")}
          imageWidth={32}
          onPush={() => router.push(`/`)}
          unStyled={true}
        />
      </View>
      <Text style={styles.resultText}>Конструктор тестов</Text>

      <View style={styles.infoText}>
        <Text style={styles.info}>Загрузите JSON файл с вопросами</Text>
      </View>

      <View style={styles.buttonsWrapper}>
        <PushButton
          text={"Загрузить JSON"}
          backgroundColor="#0A99D2"
          onPush={handleLoadJson}
        />
        <PushButton
          text={"Сбросить кэш"}
          onPush={handleResetCache}
          backgroundColor="#6B22F2"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#232227",
    padding: 20,
  },
  resultText: {
    textAlign: "left",
    color: "white",
    fontFamily: "ActayWide-Bold",
    fontSize: 20,
    marginTop: 80,
    marginBottom: 10,
  },
  infoText: {
    marginBottom: 30,
  },
  info: {
    color: "#848188",
    fontFamily: "Actay-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  buttonsWrapper: {
    flexDirection: "row",
    gap: 20,
  },
  cross: {
    paddingLeft: 15,
    paddingTop: 34,
    position: "absolute",
    zIndex: 1,
  },
});
