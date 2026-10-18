import { useEffect, useState } from "react";
import { useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { MatchingQuestion } from "../types/question";
import PushButton from "./PushButton";
import QuestionImageViewer from "./QuestionImageViewer";

type MatchingQuestionProps = {
  question: MatchingQuestion;
  withButton: boolean;
  onConfirm?: (answer: any) => void;
  savedAnswer?: number[];
  viewedQuestionIndex?: number;
};



export default function MatchingQuestionCard({
  question,
  withButton,
  onConfirm,
  savedAnswer,
  viewedQuestionIndex
}: MatchingQuestionProps) {
  const [selectedOptionLeft, setSelectionLeft] = useState<number | null>(null);
  const [selectedOptionRight, setSelectionRight] = useState<number | null>(
    null,
  );
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState("Ответить");

  const [mapping, setMapping] = useState<Record<number, number>>({});

  // Новый стейт для перемешанных индексов правого столбца
  const [shuffledRightIndices, setShuffledRightIndices] = useState<number[]>(
    [],
  );

   const [buttonColor, setButtonColor] = useState("#0A99D2")

  const isLeftPaired = (index: number) => mapping[index] !== undefined;
  const isRightPaired = (index: number) =>
    Object.values(mapping).includes(index);

  const shuffleArray = (n: number) => {
    const arr = Array.from({ length: n }, (_, i) => i);

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  };

  // --- ЛОГИКА КЛИКА ПО ЛЕВОМУ ЭЛЕМЕНТУ ---
  const handleLeftClick = (leftIndex: number) => {
    if (isConfirmed) return;

    // Сценарий 1: Элемент уже в паре -> разорвать пару
    if (isLeftPaired(leftIndex)) {
      const newMapping = { ...mapping };
      delete newMapping[leftIndex];
      setMapping(newMapping);
      setSelectionLeft(null);
      return;
    }

    // Сценарий 2: Активен правый элемент -> создать пару
    if (selectedOptionRight !== null) {
      const newMapping = { ...mapping };

      // Если этот правый элемент уже был с кем-то спарен, удаляем старую пару
      const oldLeftKey = Object.keys(newMapping).find(
        (key) => newMapping[Number(key)] === selectedOptionRight,
      );
      if (oldLeftKey !== undefined) {
        delete newMapping[Number(oldLeftKey)];
      }

      // Создаем новую пару: Ключ = левый, Значение = правый
      newMapping[leftIndex] = selectedOptionRight;
      setMapping(newMapping);
      setSelectionLeft(null);
      setSelectionRight(null);
      return;
    }

    // Сценарий 3: Нет активных элементов -> просто делаем левый активным
    setSelectionLeft(leftIndex);
    setSelectionRight(null);
  };

  // --- ЛОГИКА КЛИКА ПО ПРАВОМУ ЭЛЕМЕНТУ (Зеркальная) ---
  const handleRightClick = (rightIndex: number) => {
    if (isConfirmed) return;

    // Сценарий 1: Элемент уже в паре -> разорвать пару
    if (isRightPaired(rightIndex)) {
      const newMapping = { ...mapping };
      const oldLeftKey = Object.keys(newMapping).find(
        (key) => newMapping[Number(key)] === rightIndex,
      );
      if (oldLeftKey !== undefined) {
        delete newMapping[Number(oldLeftKey)];
      }
      setMapping(newMapping);
      setSelectionRight(null);
      return;
    }

    // Сценарий 2: Активен левый элемент -> создать пару
    if (selectedOptionLeft !== null) {
      const newMapping = { ...mapping };

      // Создаем новую пару: Ключ = левый, Значение = правый
      newMapping[selectedOptionLeft] = rightIndex;
      setMapping(newMapping);
      setSelectionLeft(null);
      setSelectionRight(null);
      return;
    }

    // Сценарий 3: Нет активных элементов -> просто делаем правый активным
    setSelectionRight(rightIndex);
    setSelectionLeft(null);
  };

  const confirmAnswer = () => {
    if (Object.keys(mapping).length === question.optionsLeft.length) {
      const resultArray = Object.entries(mapping)
        .sort(([leftA], [leftB]) => Number(leftA) - Number(leftB))
        .map(([_, rightIndex]) => rightIndex);

      setIsConfirmed(true);
      setButtonText("Ответ принят");
      setButtonColor("#125772");
      onConfirm?.(resultArray);
    } else {
      alert("Внимание, сопоставьте все элементы перед ответом");
    }
  };



  useEffect(() => {
    setMapping({});
    setSelectionLeft(null);
    setSelectionRight(null);
    setIsConfirmed(false);
    setButtonText("Ответить");
    setButtonColor("#0A99D2");
    
    // Генерируем перемешанный порядок только при смене вопроса
    setShuffledRightIndices(shuffleArray(question.optionsRight.length));
  }, [question.id]); // <-- Убрали savedAnswer отсюда!



  // 2. Срабатывает, когда меняется отображаемый ответ (переключение пользовательский/правильный)
  // Этот эффект ТОЛЬКО обновляет пары, не перемешивая массив заново.
  useEffect(() => {
    if (savedAnswer && Array.isArray(savedAnswer) && savedAnswer.length > 0) {
      const restoredMapping: Record<number, number> = {};
      savedAnswer.forEach((rightIdx, leftIdx) => {
        restoredMapping[leftIdx] = rightIdx;
      });

      setMapping(restoredMapping);
      setIsConfirmed(true);
      setButtonText("Ответ принят");
      setButtonColor("#125772");
    } else {
      // Если ответа нет (например, вернулись к просмотру null-ответа пользователя), сбрасываем пары
      setMapping({});
      setIsConfirmed(false);
      setButtonText("Ответить");
      setButtonColor("#0A99D2");
    }
  }, [savedAnswer]); // <-- Реагируем только на изменение ответа


  
  const getLeftStyle = (index: number) => {
    if (isLeftPaired(index)) return styles.pairedOptionLeft;
    if (selectedOptionLeft === index) return styles.activeOptionLeft;
    return styles.optionLeft;
  };

  const getRightStyle = (index: number) => {
    if (isRightPaired(index)) return styles.pairedOptionRight;
    if (selectedOptionRight === index) return styles.activeOptionRight;
    return styles.optionRight;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionText}>{viewedQuestionIndex !== undefined ? viewedQuestionIndex : question.id}. {question.text}</Text>
        <QuestionImageViewer uri={question.img} />
        
        <View style={styles.optionsContainer}>
          <View style={styles.leftOptions}>
            {question.optionsLeft.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getLeftStyle(index)}
                onPress={
                  withButton
                    ? () => handleLeftClick(index)
                    : () => {
                        return;
                      }
                }
              >
                <Text style={styles.numberLeft}>{index + 1}</Text>
                <View style={styles.textWrapper}>
                    <Text style={styles.optionText}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.rightOptions}>
            {shuffledRightIndices.map((originalIndex) => {
              // 1. Ищем левый ключ, который спарен с этим правым индексом
              const leftKey = Object.keys(mapping).find(
                (key) => mapping[Number(key)] === originalIndex
              );
              
              // 2. Если ключ найден, вычисляем номер для отображения (ключ + 1)
              const leftNumber = leftKey !== undefined ? Number(leftKey) + 1 : null;

              return (
                <TouchableOpacity
                  key={originalIndex}
                  style={getRightStyle(originalIndex)}
                  onPress={
                    withButton
                      ? () => handleRightClick(originalIndex)
                      : () => {
                          return;
                        }
                  }
                >
                    <View style={styles.textWrapper}>
                        <Text style={styles.optionText}>
                            {question.optionsRight[originalIndex]}
                        </Text>
                    </View>
                  
                  {/* 3. Отображаем номер только если пара существует */}
                  {leftNumber !== null && (
                    <Text style={styles.numberRight}>{leftNumber}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {withButton && <View style={styles.buttonWrapper}><PushButton text={buttonText} 
                                            backgroundColor={buttonColor}
                                            onPush={confirmAnswer}
                                            disabled={isConfirmed}/>    
                                            </View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  questionText: {
    fontFamily: "ActayWide-Bold",
    color: "white",
    fontSize: 14,
    marginBottom: 20,
  },

  optionLeft: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-start",
    backgroundColor: "#1D1C23",
    borderRadius: 10,
    marginVertical: 5,
    padding: 8,
    borderWidth: 1,
    borderColor: "#0A99D2",
    width: "100%",
  },
  optionRight: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 5,
    alignItems: "center",
    backgroundColor: "#1D1C23",
    borderRadius: 10,
    marginVertical: 5,
    padding: 8,
    borderWidth: 1,
    borderColor: "#6B22F2",
    width: "100%",
  },
  optionText: {
    fontFamily: "Actay-Regular",
    color: "white",
    fontSize: 10,
    textAlign: "left",
  },
  textWrapper: {
    flex: 1,           // Заставляет обёртку занимать всё доступное место
    flexShrink: 1,     // Позволяет сжиматься
    minWidth: 0,       // КРИТИЧНО! Позволяет тексту переноситься
  },
  numberLeft: {
    fontFamily: "ActayWide-Bold",
    color: "#5211cb",
    fontSize: 10,
    textAlign: "center",
  },
  numberRight: {
    fontFamily: "ActayWide-Bold",
    color: "#0A99D2",
    fontSize: 10,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  leftOptions: {
    width: "35%",
  },
  rightOptions: {
    width: "60%",
  },
  pairedOptionLeft: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-start",
    backgroundColor: "#0F7BA6",
    borderRadius: 10,
    marginVertical: 5,
    padding: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#0A99D2",
    width: "100%",
  },
  activeOptionLeft: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-start",
    backgroundColor: "#0F7BA6",
    borderRadius: 10,
    marginVertical: 5,
    padding: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#0A99D2",
    width: "100%",
  },
  pairedOptionRight: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    alignItems: "flex-start",
    backgroundColor: "#4D239C",
    borderRadius: 10,
    marginVertical: 5,
    padding: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#6B22F2",
    width: "100%",
  },
  activeOptionRight: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 5,
    alignItems: "center",
    backgroundColor: "#4D239C",
    borderRadius: 10,
    marginVertical: 5,
    padding: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#6B22F2",
    width: "100%",
  },

  buttonWrapper:{
        alignItems: 'flex-end',
    },
});
