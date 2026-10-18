import QuestionCard from "@/components/QuestionCard";
import { Question } from "@/types/question";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import PushButton from "../components/PushButton";

export default function MistakesScreen() {
  const router = useRouter();

  // const { subjectId } = useLocalSearchParams();
  // const subject = testData.subjects.find((s) => s.id === subjectId);

  const [mistakes, setMistakes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMistakes = async () => {
      try {
        const jsonString = await AsyncStorage.getItem("mistakes");
        if (jsonString) {
          const parsedData = JSON.parse(jsonString);
          setMistakes(parsedData); // Сохраняем реальный массив в стейт
        }
      } catch (e) {
        console.error("Ошибка чтения:", e);
      } finally {
        setIsLoading(false); // Загрузка завершена
      }
    };
    loadMistakes();
  }, []); // Пустой массив [] означает "выполнить только 1 раз при открытии"

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Загрузка ошибок...</Text>
      </View>
    );
  }

  if (mistakes.length === 0) {
    return (
      <View style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontFamily: "ActayWide-Bold",
            }}
          >
            Ошибок нет! 🎉
          </Text>
          <PushButton
            text="На главную"
            backgroundColor="#0A99D2"
            onPush={() => router.push(`/`)}
          />
        </View>
      </View>
    );
  }

  const getReviewAnswer = (item: Question) => {
    if (item.type === "written-answer-question") {
      return (item.correctAnswer as string[])[0];
    }
    return item.correctAnswer;
  };

  function MistakeRow({
    mistakeItem,
    getReviewAnswer,
    viewedIndex
  }: {
    mistakeItem: any;
    getReviewAnswer: (q: any) => any;
    viewedIndex: number;
  }) {
    // false = показываем ошибку пользователя, true = показываем правильный ответ
    const [showCorrect, setShowCorrect] = useState(false);

    // Решаем, какой ответ передать в карточку
    const answerToShow = showCorrect
      ? getReviewAnswer(mistakeItem.question) // Правильный ответ
      : mistakeItem.userAnswer; // Ответ пользователя (может быть null)

    return (
      <View style={styles.question}>
        <View style={styles.questionTextWrapper}>
          <View style={styles.questionIndicator}>
            <PushButton
              // Меняем картинку и действие в зависимости от состояния
              image={
                showCorrect
                  ? require("../media/rightAnswer.png")
                  : require("../media/wrongAnswer.png")
              }
              onPush={() => setShowCorrect(!showCorrect)} // Переключаем состояние при нажатии!
              unStyled={true}
            />
          </View>

          <QuestionCard
            question={mistakeItem.question}
            withButton={false}
            savedAnswer={answerToShow}
            viewedQuestionIndex={viewedIndex+1}
          />
        </View>
      </View>
    );
  }

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

      <View style={styles.cross}>
        <PushButton
          image={require("../media/crossSign.png")}
          onPush={() => router.push(`/`)}
          imageWidth={32}
        />
      </View>

      <View style={styles.questionsWrapper}>
        <FlatList
          style={styles.questionsContainer}
          showsVerticalScrollIndicator={false}
          data={mistakes}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item, index }) => (
            <MistakeRow viewedIndex={index} mistakeItem={item} getReviewAnswer={getReviewAnswer} />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#232227",

    paddingBottom: 150,
    paddingTop: 20
  },

  questionsWrapper: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
  },

  questionsContainer: {
    //paddingHorizontal: 20
  },

  question: {
    borderStyle: "solid",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#403E47",
    paddingBottom: 20,
  },

  questionIndicator: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
  },

  questionTextWrapper: {
    paddingHorizontal: 20,
  },

  questionNumber: {
    textAlign: "right",
    fontFamily: "Actay-Regular",
    color: "#0F7BA6",
    fontSize: 14,
    marginVertical: 20,
  },
  rightAnswer: {
    color: "#676767",
    textAlign: "right",
  },

  cross: {
    paddingLeft: 15,
    paddingTop: 34,
    position: "absolute",
    zIndex: 1,
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
