    import { useEffect, useState } from "react";
    import {
        Image,
        ScrollView,
        StyleSheet,
        Text,
        TouchableOpacity,
        View,
    } from "react-native";
    import { SingleAnswerQuestion } from "../types/question";
    import PushButton from "./PushButton";
    import QuestionImageViewer from "./QuestionImageViewer";

    type SingleQuestionProps = {
    question: SingleAnswerQuestion;
    withButton: boolean;
    onConfirm?: (answer: any) => void;
    savedAnswer?: number | null;
    viewedQuestionIndex?: number;
    };

    export default function SingleQuestionCard({
    question,
    withButton,
    onConfirm,
    savedAnswer,
    viewedQuestionIndex,
    }: SingleQuestionProps) {
    const [selectedOption, setSelection] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [buttonText, setButtonText] = useState("Ответить");
    const [buttonColor, setButtonColor] = useState("#0A99D2");

    const confirmAnswer = () => {
        if (selectedOption !== null) {
        setIsConfirmed(true);
        setButtonText("Ответ принят");
        setButtonColor("#125772");
        onConfirm?.(selectedOption);
        }
    };

    const setSelectedOption = (index: number) => {
        if (!isConfirmed) {
        setSelection(index);
        }
    };

    useEffect(() => {
        setSelection(null);
        setIsConfirmed(false);
        setButtonText("Ответить");
        setButtonColor("#0A99D2");
        if (savedAnswer !== undefined && savedAnswer !== null) {
        setSelection(savedAnswer);
        setIsConfirmed(true);
        setButtonText("Ответ принят");
        setButtonColor("#125772");
        }
    }, [question.id, savedAnswer]);

    return (
        <View style={styles.container}>
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.questionText}>
            {viewedQuestionIndex !== undefined
                ? viewedQuestionIndex
                : question.id}
            . {question.text}
            </Text>

            <QuestionImageViewer uri={question.img} />

            {question.options.map((option, index) => (
            <TouchableOpacity
                key={index}
                style={
                selectedOption === index ? styles.selectedOption : styles.option
                }
                onPress={
                withButton
                    ? () => setSelectedOption(index)
                    : () => {
                        return;
                    }
                }
                disabled={isConfirmed}
            >
                <Image
                source={
                    selectedOption === index
                    ? require("../media/radioButtonChecked.png")
                    : require("../media/radioButtonUnchecked.png")
                }
                style={styles.img}
                />
                <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
            ))}

            {withButton && (
            <View style={styles.buttonWrapper}>
                <PushButton
                text={buttonText}
                backgroundColor={buttonColor}
                onPush={confirmAnswer}
                disabled={selectedOption === null || isConfirmed}
                />
            </View>
            )}
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
        marginBottom: 10, 
    },
    selectedOption: {
        marginVertical: 5,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexShrink: 1,
    },
    option: {
        marginVertical: 5,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexShrink: 1,
    },
    optionText: {
        fontFamily: "Actay-Regular",
        color: "white",
        fontSize: 14,
    },
    img: {
        height: 24,
        width: 24,
        resizeMode: "contain",
    },
    buttonWrapper: {
        alignItems: "flex-end",
        marginTop: 15,
    },
    });
