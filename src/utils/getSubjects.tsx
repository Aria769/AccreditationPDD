import AsyncStorage from "@react-native-async-storage/async-storage";
import testData from "../data/tests.json";

export const getAllSubjects = async () => {
  try {
    const storedData = await AsyncStorage.getItem("customTestData");
    if (storedData) {
      const customData = JSON.parse(storedData);

      // Собираем ID встроенных предметов, чтобы избежать дубликатов
      const builtInIds = new Set(testData.subjects.map((s: any) => s.id));

      // Оставляем только те пользовательские предметы, которых нет во встроенных
      const uniqueCustomSubjects = customData.subjects.filter(
        (s: any) => !builtInIds.has(s.id),
      );

      // Объединяем массивы
      return [...testData.subjects, ...uniqueCustomSubjects];
    }
    return testData.subjects;
  } catch (error) {
    console.error("Ошибка загрузки предметов:", error);
    return testData.subjects;
  }
};
