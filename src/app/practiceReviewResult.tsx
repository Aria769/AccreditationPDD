import PushButton from "@/components/PushButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import PieChart from "react-native-pie-chart";

export default function PracticeReviewResultScreen() {
  const router = useRouter();
  const { correctAnswersCount } = useLocalSearchParams();
  const { questions } = useLocalSearchParams();

  const correctAnswersCountNumber = Number(correctAnswersCount) || 0;
  const questionsAmount = Number(questions) || 1;

  const percentage = Math.round(
    (correctAnswersCountNumber * 100) / questionsAmount,
  );

  const widthAndHeight = 100;

  const series = [
    { value: percentage, color: "#6B22F2" },
    { value: 100-percentage, color: "#35333D" },
  ];
//как говорил мой дед
  return (
    <View style={styles.container}>
      <Image
        source={require("../media/topLight.png")}
        style={styles.backgroundImage1}
        resizeMode="cover"
      />
      {percentage >= 70 ? (
        <Image
          source={require("../media/KiraSmiling.png")}
          style={styles.backgroundImage2}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={require("../media/KiraCrying.png")}
          style={styles.backgroundImage2}
          resizeMode="contain"
        />
      )}

      <Text style={styles.resultText}>Результат:</Text>

      <PieChart
        style={styles.pieChart}
        widthAndHeight={widthAndHeight}
        series={series}
      />

      <Text style={styles.numberResultText}>{percentage}%</Text>

      <View style={styles.buttonsWrapper}>
        <PushButton
          text={"Выйти"}
          backgroundColor="#393B50"
          onPush={() => {
            router.push(`/`);
          }}
        />
        <PushButton
          text={"Посмотреть ошибки"}
          backgroundColor="#0A99D2"
          onPush={() => {
            router.push(`/practiceReview`);
          }}
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
  },
  resultText: {
    textAlign: "left",
    color: "white",
    fontFamily: "ActayWide-Bold",
    fontSize: 20,
    marginTop: 80,
    marginBottom: 20,
  },

  numberResultText: {
    textAlign: "left",
    color: "white",
    fontFamily: "ActayWide-Bold",
    fontSize: 48,
    marginBottom: 20,
  },

  buttonsWrapper: {
    flexDirection: "row",
    gap: 20,
  },

  backgroundImage1: {
    position: "absolute",
    top: -100,
    zIndex: 0,
    alignSelf: "center",
    pointerEvents: "none",
  },

  backgroundImage2: {
    position: "absolute",
    bottom: -140,
    zIndex: 1,
    alignSelf: "center",
    height: "70%",
    pointerEvents: "none",
  },

  pieChart: {
    borderRadius: 100,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
