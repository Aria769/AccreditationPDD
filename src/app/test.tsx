import PushButton from "@/components/PushButton";
import QuestionCard from "@/components/QuestionCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { getAllSubjects } from "../utils/getSubjects";

export default function TestScreen() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(1200);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      const allSubjects = await getAllSubjects();
      setSubjects(allSubjects);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const subject = subjects.find((s) => String(s.id) === String(subjectId));

  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    if (subject && subject.questions) {
      setShuffledQuestions(shuffleArray(subject.questions));
      setAnswers({});
      setQuestionIndex(0);
      setTimeLeft(subject.questions.length * 60);
      isFinishedRef.current = false;
    }
  }, [subject]);

  const storeData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Ошибка сохранения:", e);
    }
  };

  const calculateResult = useCallback(() => {
    let correctCount = 0;
    shuffledQuestions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === undefined || userAnswer === null) return;

      switch (question.type) {
        case "single-answer-question":
          if (userAnswer === question.correctAnswer) correctCount++;
          break;
        case "multiple-answer-question":
          const sortedUser = [...userAnswer].sort((a, b) => a - b);
          const sortedCorrect = [...question.correctAnswer].sort(
            (a, b) => a - b,
          );
          if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect))
            correctCount++;
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
            correctCount++;
          break;
        case "matching-question":
          // Преобразуем индексы в значения перед сравнением
          const userMatchingValues = userAnswer.map(
            (idx: number) => question.optionsRight[idx],
          );
          const correctMatchingValues = question.correctAnswer.map(
            (idx: number) => question.optionsRight[idx],
          );
          if (
            JSON.stringify(userMatchingValues) ===
            JSON.stringify(correctMatchingValues)
          )
            correctCount++;
          break;
        case "sequence-question":
          const userSequenceValues = userAnswer.map(
            (idx: number) => question.lines[idx],
          );
          const correctSequenceValues = question.correctAnswer.map(
            (idx: number) => question.lines[idx],
          );
          if (
            JSON.stringify(userSequenceValues) ===
            JSON.stringify(correctSequenceValues)
          )
            correctCount++;
          break;
      }
    });
    return correctCount;
  }, [shuffledQuestions, answers]);

  const finishTest = useCallback(async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    const mistakesToSave: any[] = [];
    shuffledQuestions.forEach((question, index) => {
      const userAnswer = answers[index];

      if (userAnswer === undefined || userAnswer === null) {
        mistakesToSave.push({ question, userAnswer: null });
        return;
      }

      let isCorrect = false;
      switch (question.type) {
        case "single-answer-question":
          if (userAnswer === question.correctAnswer) isCorrect = true;
          break;
        case "multiple-answer-question":
          const sortedUser = [...userAnswer].sort((a, b) => a - b);
          const sortedCorrect = [...question.correctAnswer].sort(
            (a, b) => a - b,
          );
          if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect))
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
          const userMatchingValues = userAnswer.map(
            (idx: number) => question.optionsRight[idx],
          );
          const correctMatchingValues = question.correctAnswer.map(
            (idx: number) => question.optionsRight[idx],
          );
          if (
            JSON.stringify(userMatchingValues) ===
            JSON.stringify(correctMatchingValues)
          )
            isCorrect = true;
          break;
        case "sequence-question":
          const userSequenceValues = userAnswer.map(
            (idx: number) => question.lines[idx],
          );
          const correctSequenceValues = question.correctAnswer.map(
            (idx: number) => question.lines[idx],
          );
          if (
            JSON.stringify(userSequenceValues) ===
            JSON.stringify(correctSequenceValues)
          )
            isCorrect = true;
          break;
      }
      if (!isCorrect) {
        mistakesToSave.push({ question, userAnswer });
      }
    });

    await storeData("mistakes", JSON.stringify(mistakesToSave));

    try {
      const existingData = await AsyncStorage.getItem("allMistakes");
      const existingMistakes: any[] = existingData
        ? JSON.parse(existingData)
        : [];
      const existingKeys = new Set(
        existingMistakes.map((m) => `${m.subjectId}-${m.question.id}`),
      );

      const newMistakesWithSubject = mistakesToSave
        .filter((m) => {
          const key = `${subjectId}-${m.question.id}`;
          return !existingKeys.has(key);
        })
        .map((m) => ({ ...m, subjectId }));

      const allMistakes = [...existingMistakes, ...newMistakesWithSubject];
      await AsyncStorage.setItem("allMistakes", JSON.stringify(allMistakes));
    } catch (e) {
      console.error("Ошибка сохранения в allMistakes:", e);
    }

    router.push(
      `/result?correctAnswersCount=${calculateResult()}&questions=${shuffledQuestions.length}&subjectName=${subjectId}`,
    );
  }, [shuffledQuestions, answers, subjectId, calculateResult, router]);

  const nextAnswer = () => {
    if (questionIndex < shuffledQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const prevAnswer = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleAnswer = (answer: any) => {
    setAnswers({ ...answers, [questionIndex]: answer });
    nextAnswer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !isFinishedRef.current) {
      finishTest();
    }
  }, [timeLeft, finishTest]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Загрузка...</Text>
      </View>
    );
  }

  if (!subject) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Предмет не найден</Text>
      </View>
    );
  }

  if (shuffledQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Загрузка теста...</Text>
      </View>
    );
  }

  const progressBarPercentage =
    ((questionIndex + 1) / shuffledQuestions.length) * 100;

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
            imageWidth={32}
            onPush={() => router.push(`/`)}
            unStyled={true}
          />
        </View>

        <View style={styles.timerArea}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        <View style={styles.currentQuestionArea}>
          <Text style={styles.currentQuestion}>
            {questionIndex + 1}/{shuffledQuestions.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              { width: `${progressBarPercentage}%` },
              styles.progressIndex,
            ]}
          />
        </View>

        <View style={styles.questionsNavArea}>
          <PushButton
            image={require("../media/signPrevious.png")}
            imageWidth={32}
            onPush={prevAnswer}
            unStyled={true}
          />
          <PushButton
            image={require("../media/signNext.png")}
            imageWidth={32}
            onPush={nextAnswer}
            unStyled={true}
          />
        </View>

        <View style={styles.answerArea}>
          <QuestionCard
            question={shuffledQuestions[questionIndex]}
            onConfirm={handleAnswer}
            withButton={true}
            savedAnswer={answers[questionIndex]}
            viewedQuestionIndex={questionIndex + 1}
          />

          {questionIndex === shuffledQuestions.length - 1 ? (
            <View style={styles.endTest}>
              <PushButton
                text={"Завершить"}
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
  answerArea: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingBottom: 50,
    width: "100%",
    alignSelf: "center",
    zIndex: 1,
  },
  timerArea: {
    alignItems: "center",
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
  timerText: {
    fontFamily: "Actay-Regular",
    fontSize: 20,
    color: "white",
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
    zIndex: 1,
    alignSelf: "center",
    pointerEvents: "none",
  },
  backgroundImage2: {
    position: "absolute",
    bottom: "-35%",
    zIndex: 1,
    alignSelf: "center",
    height: "70%",
    pointerEvents: "none",
  },
  endTest: {
    zIndex: 2,
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
});
