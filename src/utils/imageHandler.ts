import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import localforage from "localforage"; // ✅ Библиотека для работы с IndexedDB на вебе
import { showAlert } from '../utils/showAlert';

// ✅ Создаём отдельное хранилище для картинок на вебе (IndexedDB, лимит ~50-100+ МБ)
const webImageStore = localforage.createInstance({
  name: "AccreditationPDD_Images",
  storeName: "question_images",
});

const IMAGE_CACHE_KEY = "question_images_cache";

type ImageCache = {
  [key: string]: string;
};

// --- Вспомогательные функции для МОБИЛЬНЫХ (остаются без изменений) ---
const getImageCache = async (): Promise<ImageCache> => {
  try {
    const cached = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    console.error("Ошибка чтения кэша:", e);
    return {};
  }
};

const saveImageCache = async (cache: ImageCache) => {
  try {
    await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("Ошибка сохранения кэша:", e);
  }
};

// --- ОСНОВНЫЕ ФУНКЦИИ ---

export const pickAndCacheImage = async (
  questionId: number,
  subjectId: string,
): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert("Необходим доступ к галерее");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.7,
      base64: Platform.OS === "web", // ✅ ДЛЯ ВЕБА: запрашиваем base64, так как FileSystem не работает
    });

    if (!result.canceled && result.assets[0]) {
      const cacheKey = `${subjectId}_${questionId}`;

      if (Platform.OS === "web") {
        // 🌐 ВЕБ: Сохраняем Base64 строку в IndexedDB (безопасно и вместительно)
        if (result.assets[0].base64) {
          const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
          await webImageStore.setItem(cacheKey, base64String);
          console.log("✅ Картинка сохранена в IndexedDB (Web):", cacheKey);
          return base64String;
        }
      } else {
        // 📱 МОБИЛЬНЫЕ: Твоя исходная, проверенная логика с FileSystem
        const sourceUri = result.assets[0].uri;
        const fileName = `${subjectId}_${questionId}.jpg`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.copyAsync({
          from: sourceUri,
          to: fileUri,
        });

        const cache = await getImageCache();
        cache[cacheKey] = fileUri;
        await saveImageCache(cache);

        console.log("✅ Картинка сохранена в FileSystem (Mobile):", fileUri);
        return fileUri;
      }
    }

    return null;
  } catch (error) {
    console.error("Ошибка при сохранении изображения:", error);
    return null;
  }
};

export const getQuestionImage = async (
  questionId: number,
  subjectId: string,
): Promise<string | undefined> => {
  const cacheKey = `${subjectId}_${questionId}`;

  if (Platform.OS === "web") {
    // 🌐 ВЕБ: Читаем из IndexedDB
    return (await webImageStore.getItem(cacheKey)) as string | undefined;
  } else {
    // 📱 МОБИЛЬНЫЕ: Читаем из AsyncStorage
    const cache = await getImageCache();
    return cache[cacheKey];
  }
};

export const removeQuestionImage = async (
  questionId: number,
  subjectId: string,
) => {
  try {
    const cacheKey = `${subjectId}_${questionId}`;

    if (Platform.OS === "web") {
      // 🌐 ВЕБ: Просто удаляем запись из IndexedDB
      await webImageStore.removeItem(cacheKey);
    } else {
      // 📱 МОБИЛЬНЫЕ: Удаляем файл и запись в AsyncStorage
      const cache = await getImageCache();
      const uri = cache[cacheKey];

      if (uri && !uri.startsWith("data:image")) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      delete cache[cacheKey];
      await saveImageCache(cache);
    }
  } catch (error) {
    console.error("Ошибка при удалении изображения:", error);
  }
};

export const clearSubjectImages = async (subjectId: string) => {
  try {
    if (Platform.OS === "web") {
      // 🌐 ВЕБ: Перебираем ключи в IndexedDB и удаляем нужные
      const keys = await webImageStore.keys();
      let deletedCount = 0;
      for (const key of keys) {
        if (key.startsWith(`${subjectId}_`)) {
          await webImageStore.removeItem(key);
          deletedCount++;
        }
      }
      console.log(`✅ Удалено ${deletedCount} картинок предмета ${subjectId} из IndexedDB`);
    } else {
      // 📱 МОБИЛЬНЫЕ: Твоя исходная логика
      const cache = await getImageCache();
      const keysToDelete: string[] = [];

      for (const key in cache) {
        if (key.startsWith(`${subjectId}_`)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        const uri = cache[key];
        if (uri && !uri.startsWith("data:image")) {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (error) {
            console.warn(`Не удалось удалить файл ${uri}:`, error);
          }
        }
        delete cache[key];
      }

      await saveImageCache(cache);
      console.log(`✅ Удалено ${keysToDelete.length} картинок предмета ${subjectId}`);
    }
  } catch (error) {
    console.error("Ошибка при очистке картинок:", error);
  }
};