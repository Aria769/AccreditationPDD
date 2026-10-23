import PushButton from "@/components/PushButton";
import QuestionCard from "@/components/QuestionCard";
import { Question } from "@/types/question";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, View } from "react-native";
import testData from "../data/tests.json";
import { getAllSubjects } from "../utils/getSubjects";
import {
  clearSubjectImages,
  getQuestionImage,
  pickAndCacheImage,
  removeQuestionImage,
} from "../utils/imageHandler"; // ✅ Импортируй утилиты

export default function SubjectEditor() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const { subjectId } = useLocalSearchParams();
  const [questionImages, setQuestionImages] = useState<{
    [key: number]: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      const allSubjects = await getAllSubjects();
      setSubjects(allSubjects);

      // Загрузить изображения для всех вопросов
      if (subjectId) {
        const subject = allSubjects.find((s) => s.id === subjectId);
        if (subject) {
          const images: { [key: number]: string } = {};
          for (const question of subject.questions) {
            const img = await getQuestionImage(
              question.id,
              subjectId as string,
            );
            if (img) {
              images[question.id] = img;
            }
          }
          setQuestionImages(images);
        }
      }
    };
    loadData();
  }, [subjectId]);

  const subject = subjects.find((s) => s.id === subjectId);

  if (!subject) {
    return (
      <View>
        <Text>Предмет не найден</Text>
      </View>
    );
  }

  const getReviewAnswer = (item: Question) => {
    if (item.type === "written-answer-question") {
      return (item.correctAnswer as string[])[0];
    }
    return item.correctAnswer;
  };

  // ✅ Функция для добавления изображения к вопросу
  const handleAddImage = async (questionId: number) => {
    if (!subjectId) return;

    const imageUrl = await pickAndCacheImage(questionId, subjectId as string);

    if (imageUrl) {
      // Обновить стейт для отображения
      setQuestionImages((prev) => ({
        ...prev,
        [questionId]: imageUrl,
      }));

      // Обновить вопрос в хранилище
      const storedData = await AsyncStorage.getItem("customTestData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const subjectIndex = parsedData.subjects.findIndex(
          (s: any) => s.id === subjectId,
        );

        if (subjectIndex !== -1) {
          const questionIndex = parsedData.subjects[
            subjectIndex
          ].questions.findIndex((q: any) => q.id === questionId);

          if (questionIndex !== -1) {
            parsedData.subjects[subjectIndex].questions[questionIndex].img =
              imageUrl;

            await AsyncStorage.setItem(
              "customTestData",
              JSON.stringify(parsedData),
            );
            Alert.alert("Успех", "Изображение добавлено к вопросу");
          }
        }
      }
    }
  };

  const handleDeleteImage = async (questionId: number) => {
    Alert.alert(
      "Удалить изображение",
      "Вы уверены, что хотите удалить изображение из этого вопроса?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            if (!subjectId) return;

            // Удаляем из кэша
            await removeQuestionImage(questionId, subjectId as string);

            // Удаляем из стейта
            setQuestionImages((prev) => {
              const newImages = { ...prev };
              delete newImages[questionId];
              return newImages;
            });

            // Удаляем из хранилища
            const storedData = await AsyncStorage.getItem("customTestData");
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              const subjectIndex = parsedData.subjects.findIndex(
                (s: any) => s.id === subjectId,
              );

              if (subjectIndex !== -1) {
                const questionIndex = parsedData.subjects[
                  subjectIndex
                ].questions.findIndex((q: any) => q.id === questionId);

                if (questionIndex !== -1) {
                  delete parsedData.subjects[subjectIndex].questions[
                    questionIndex
                  ].img;

                  await AsyncStorage.setItem(
                    "customTestData",
                    JSON.stringify(parsedData),
                  );
                }
              }
            }
          },
        },
      ],
    );
  };

  const handleDeleteSubject = () => {
    Alert.alert(
      "Удаление предмета",
      "Вы уверены, что хотите удалить этот предмет? Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Удалить", style: "destructive", onPress: performDelete },
      ],
    );
  };

  const performDelete = async () => {
    try {
      const isBuiltIn = testData.subjects.some(
        (subject) => subject.id === subjectId,
      );
      if (isBuiltIn) {
        Alert.alert("Ошибка", "Встроенные предметы удалять нельзя.");
        return;
      }

      // ✅ Сначала удаляем все картинки предмета
      await clearSubjectImages(subjectId as string);

      const storedData = await AsyncStorage.getItem("customTestData");
      if (!storedData) {
        Alert.alert("Ошибка", "Данные не найдены или предмет уже удален.");
        return;
      }

      const parsedData = JSON.parse(storedData);
      const initialLength = parsedData.subjects.length;

      const updatedSubjects = parsedData.subjects.filter(
        (subject: any) => subject.id !== subjectId,
      );

      if (updatedSubjects.length === initialLength) {
        Alert.alert("Ошибка", "Этот предмет не является пользовательским.");
        return;
      }

      await AsyncStorage.setItem(
        "customTestData",
        JSON.stringify({ subjects: updatedSubjects }),
      );

      Alert.alert("Успех", "Предмет успешно удален.", [
        {
          text: "OK",
          onPress: () => router.push("/"),
        },
      ]);
    } catch (error) {
      console.error("Ошибка при удалении предмета:", error);
      Alert.alert("Ошибка", "Не удалось удалить предмет. Попробуйте позже.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../media/topLight.png")}
        style={styles.backgroundImage1}
        resizeMode="cover"
      />
      <Image
        source={require("../media/KiraLookingUp.png")}
        style={styles.backgroundImage2}
        resizeMode="contain"
      />

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.cross}>
            <PushButton
              image={require("../media/crossSign.png")}
              imageWidth={32}
              onPush={() => router.push(`/`)}
              unStyled={true}
            />
          </View>

          <Text style={styles.subjectNameText}>{subject.name}</Text>

          <View style={styles.trashcanWrapper}>
            <PushButton
              image={require("../media/trashcanIcon.png")}
              imageWidth={32}
              onPush={handleDeleteSubject}
            />
          </View>
        </View>

        <View style={styles.questionsWrapper}>
          <FlatList
            style={styles.questionsContainer}
            showsVerticalScrollIndicator={false}
            data={subject.questions}
            extraData={questionImages}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const hasImage = !!questionImages[item.id];

              return (
                <View style={styles.question}>
                  <View style={styles.questionContent}>
                    <QuestionCard
                      question={{
                        ...item,
                        img: questionImages[item.id] // ✅ Убрали || item.img
                      }}
                      withButton={false}
                      savedAnswer={getReviewAnswer(item)}
                    />
                  </View>
                  <View style={styles.imageIconWrapper}>
                    <PushButton
                      image={
                        hasImage
                          ? require("../media/deleteImageIcon.png")
                          : require("../media/addImageIcon.png")
                      }
                      imageWidth={32}
                      onPush={
                        hasImage
                          ? () => handleDeleteImage(item.id)
                          : () => handleAddImage(item.id)
                      }
                    />
                  </View>
                </View>
              );
            }}
                    />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#232227",
    paddingBottom: 150,
    paddingTop: 60,
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    //marginTop: 40,
    gap: 5,
    //paddingHorizontal: 20,
    width: "100%",
  },
  subjectNameText: {
    textAlign: "left",
    color: "white",
    fontFamily: "ActayWide-Bold",
    fontSize: 18,
    flex: 1,
  },
  trashcanWrapper: {},
  imageIconWrapper: {
    //paddingTop: 20,
    paddingLeft: 10,
  },
  cross: {},
  questionsWrapper: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
  },
  questionsContainer: {
    flex: 1,
    width: "100%",
  },
  question: {
    borderStyle: "solid",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#403E47",
    paddingBottom: 20,
    //paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    paddingTop: 20,
  },
  questionContent: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  backgroundImage1: {
    position: "absolute",
    top: -120,
    zIndex: 1,
    alignSelf: "center",
    pointerEvents: "none",
  },
  backgroundImage2: {
    position: "absolute",
    bottom: -250,
    zIndex: 1,
    alignSelf: "center",
    height: "70%",
    pointerEvents: "none",
  },
});
