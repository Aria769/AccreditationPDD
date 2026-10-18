import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy"; // ✅ Используем legacy API
import * as ImagePicker from "expo-image-picker";

const IMAGE_CACHE_KEY = "question_images_cache";

type ImageCache = {
  [key: string]: string;
};

export const getImageCache = async (): Promise<ImageCache> => {
  try {
    const cached = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    console.error("Ошибка чтения кэша:", e);
    return {};
  }
};

export const saveImageCache = async (cache: ImageCache) => {
  try {
    await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("Ошибка сохранения кэша:", e);
  }
};

export const pickAndCacheImage = async (
  questionId: number,
  subjectId: string,
): Promise<string | null> => {
  try {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Необходим доступ к галерее");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false, // ✅ Отключаем обрезку
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const sourceUri = result.assets[0].uri;

      const fileName = `${subjectId}_${questionId}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // ✅ Теперь copyAsync работает через legacy API
      await FileSystem.copyAsync({
        from: sourceUri,
        to: fileUri,
      });

      const cache = await getImageCache();
      const cacheKey = `${subjectId}_${questionId}`;
      cache[cacheKey] = fileUri;
      await saveImageCache(cache);

      console.log("✅ Картинка сохранена:", fileUri);
      return fileUri;
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
  const cache = await getImageCache();
  const cacheKey = `${subjectId}_${questionId}`;
  return cache[cacheKey];
};

export const removeQuestionImage = async (
  questionId: number,
  subjectId: string,
) => {
  try {
    const cache = await getImageCache();
    const cacheKey = `${subjectId}_${questionId}`;

    // ✅ Проверяем, что это путь к файлу, а не base64
    if (cache[cacheKey] && !cache[cacheKey].startsWith("data:image")) {
      await FileSystem.deleteAsync(cache[cacheKey], { idempotent: true });
    }

    delete cache[cacheKey];
    await saveImageCache(cache);
  } catch (error) {
    console.error("Ошибка при удалении изображения:", error);
  }
};

export const clearSubjectImages = async (subjectId: string) => {
  try {
    const cache = await getImageCache();
    const keysToDelete: string[] = [];

    for (const key in cache) {
      if (key.startsWith(`${subjectId}_`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const uri = cache[key];
      // ✅ Удаляем только файлы, а не base64
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
    console.log(
      `✅ Удалено ${keysToDelete.length} картинок предмета ${subjectId}`,
    );
  } catch (error) {
    console.error("Ошибка при очистке картинок:", error);
  }
};
