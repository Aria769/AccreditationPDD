import PushButton from "@/components/PushButton";
import QuestionCard from "@/components/QuestionCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

export default function MistakesTestScreen() {
  const router = useRouter();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  // Храним именно список ошибок, а не все вопросы
  const [mistakesList, setMistakesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storeData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Ошибка сохранения:", e);
    }
  };

  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Загружаем ВСЕ ошибки из памяти при открытии экрана
  useEffect(() => {
    const loadMistakes = async () => {
      try {
        const storedMistakes = await AsyncStorage.getItem("allMistakes"); // Читаем allMistakes
        if (storedMistakes) {
          const parsedMistakes = JSON.parse(storedMistakes);
          // Перемешиваем ошибки, чтобы порядок не был предсказуемым
          setMistakesList(shuffleArray(parsedMistakes));
        } else {
          setMistakesList([]);
        }
      } catch (e) {
        console.error("Ошибка загрузки ошибок:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadMistakes();
  }, []);

  const progressBarPercentage =
    mistakesList.length > 0
      ? ((questionIndex + 1) / mistakesList.length) * 100
      : 0;

  const nextAnswer = () => {
    if (questionIndex < mistakesList.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const prevAnswer = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleAnswer = (answer: any) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
    nextAnswer();
  };

  const finishTest = async () => {
    const remainingMistakes: any[] = [];
    let correctCount = 0;

    mistakesList.forEach((mistakeObj, index) => {
      const userAnswer = answers[index];
      const question = mistakeObj.question;
      let isCorrect = false;

      if (userAnswer === undefined || userAnswer === null) {
        remainingMistakes.push({
          ...mistakeObj,
          userAnswer: null 
        });
        return;
      }

      switch (question.type) {
        case "single-answer-question":
          if (userAnswer === question.correctAnswer) isCorrect = true;
          break;
        case "multiple-answer-question":
          if (
            JSON.stringify(userAnswer) ===
            JSON.stringify(question.correctAnswer)
          )
            isCorrect = true;
          break;
        case "written-answer-question":
          const correctAnswers = question.correctAnswer as string[];
          if (
            correctAnswers.some(
              (correct: string) =>
                correct.trim().toLowerCase() ===
                userAnswer.trim().toLowerCase(),
            )
          )
            isCorrect = true;
          break;
        case "matching-question":
        case "sequence-question":
          if (
            JSON.stringify(userAnswer) ===
            JSON.stringify(question.correctAnswer)
          )
            isCorrect = true;
          break;
      }

            if (!isCorrect) {
        remainingMistakes.push({
          ...mistakeObj,
          userAnswer: userAnswer 
        });
      } else {
        correctCount++;
      }
    });

    // 1. Обновляем глобальный список ошибок (исправленные удаляются)
    await storeData("allMistakes", JSON.stringify(remainingMistakes));

    // 2. Переходим на экран просмотра результатов, передавая статистику в URL
    router.push(`/practiceReviewResult?correctAnswersCount=${correctCount}&questions=${mistakesList.length}`);
  };

  // 1. Экран загрузки
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Загрузка ошибок...</Text>
      </View>
    );
  }

  // 2. Экран, если ошибок больше нет
  if (mistakesList.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Ошибок для проработки нет! 🎉</Text>
          <Text style={styles.emptySubtext}>Всё исправлено. Так держать!</Text>
          <PushButton
            text="На главную"
            backgroundColor="#0A99D2"
            onPush={() => router.push(`/`)}
          />
        </View>
      </View>
    );
  }

  // 3. Основной экран теста
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
        <View style={styles.cross}>
          <PushButton
            image={require("../media/crossSign.png")}
            onPush={() => router.push(`/`)}
            imageWidth={32}
          />
        </View>

        <View style={styles.currentQuestionArea}>
          <Text style={styles.currentQuestion}>
            {questionIndex + 1} / {mistakesList.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[{ width: `${progressBarPercentage}%` }, styles.progressIndex]}
          />
        </View>

        <View style={styles.questionsNavArea}>
          <PushButton
            image={require("../media/signPrevious.png")}
            onPush={prevAnswer}
            imageWidth={32}
          />
          <PushButton
            image={require("../media/signNext.png")}
            onPush={nextAnswer}
            imageWidth={32}
          />
        </View>

        <View style={styles.answerArea}>
          <QuestionCard
            // Важно: берем именно объект question из нашей структуры {question: ..., userAnswer: ...}
            question={mistakesList[questionIndex].question}
            onConfirm={handleAnswer}
            withButton={true}
            savedAnswer={answers[questionIndex]}
            viewedQuestionIndex={questionIndex + 1}
          />

          {questionIndex === mistakesList.length - 1 ? (
            <View style={styles.endTest}>
              <PushButton
                text={"Завершить проработку"}
                onPush={finishTest}
                backgroundColor={"#6B22F2"}
              />
            </View>
          ) : null}
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "white",
    fontSize: 24,
    fontFamily: "ActayWide-Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#848188",
    fontSize: 16,
    fontFamily: "Actay-Regular",
    textAlign: "center",
    marginBottom: 30,
  },
  answerArea: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingBottom: 50,
    width: "100%",
    alignSelf: "center",
    zIndex: 1,
  },
  currentQuestionArea: {
    alignItems: "flex-end",
  },
  questionsNavArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressBar: {
    height: 15,
    backgroundColor: "#1D1C23",
    marginTop: 5,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  progressIndex: {
    height: 15,
    backgroundColor: "#6B22F2",
    borderRadius: 20,
  },
  cross: {
    zIndex: 1,
  },
  currentQuestion: {
    fontFamily: "Actay-Regular",
    fontSize: 16,
    color: "white",
    textAlign: "right",
  },
  backgroundImage1: {
    position: "absolute",
    top: -120,
    zIndex: 0,
    alignSelf: "center",
    //width: "100%",
    pointerEvents: "none",
  },
  backgroundImage2: {
    position: "absolute",
    bottom: '-35%',
    zIndex: 0,
    alignSelf: "center",
    height: "70%",
    pointerEvents: "none",
  },
  endTest: {
    zIndex: 2,
    alignItems: "center",
    marginTop: 20,
  },
});
