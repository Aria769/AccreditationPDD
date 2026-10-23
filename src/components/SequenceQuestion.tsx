import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native'
import {SequenceQuestion} from "../types/question"
import { useState, useEffect } from 'react';
import PushButton from './PushButton';
import QuestionImageViewer from "./QuestionImageViewer";

type SequenceQuestionProps = {
    question: SequenceQuestion;
    withButton: boolean;
    onConfirm?: (answer: any) => void;
    savedAnswer?: number[];
    viewedQuestionIndex?: number;
};

export default function SequenceQuestionCard({question, withButton, onConfirm, savedAnswer, viewedQuestionIndex}: SequenceQuestionProps){
    
    const [selectedOption, setSelection] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [buttonText, setButtonText] = useState("Ответить");
    const [buttonColor, setButtonColor] = useState("#0A99D2")


    const shuffleArray = (n: number) => {
        const arr = Array.from({ length: n }, (_, i) => i);

        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; 
        }

        return arr;
    }

    const [currentOrder, setCurrentOrder] = useState(shuffleArray(question.lines.length));
    
    const confirmAnswer = () => {
        setButtonColor("#125772");
        onConfirm?.(currentOrder);
        return;
    }

    const handleItemPress = (index: number) => {
        if(isConfirmed) return;
        
        if (selectedOption === index){
            setSelection(null);
        }
        else if (selectedOption !== null){
            const currentOrderCopy = [...currentOrder];
            [currentOrderCopy[index], currentOrderCopy[selectedOption]] = [currentOrderCopy[selectedOption], currentOrderCopy[index]]
            setCurrentOrder(currentOrderCopy);
            setSelection(null);
        }
        else if(selectedOption === null){
            setSelection(index);
        }
        
        return;
    }
    
        
    useEffect(() => {
        setCurrentOrder(shuffleArray(question.lines.length))
        setSelection(null);
        setIsConfirmed(false);
        setButtonText("Ответить");
        setButtonColor("#0A99D2");
        if(savedAnswer){
            setCurrentOrder(savedAnswer);
            setIsConfirmed(true);
            setButtonText("Ответ принят");
            setButtonColor("#125772");
        }
    }, [question.id, savedAnswer])
    
    return(
        <View style={styles.container}>
            <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}>
                <Text style={styles.questionText}>{viewedQuestionIndex !== undefined ? viewedQuestionIndex : question.id}. {question.text}</Text>
                <QuestionImageViewer uri={question.img} />
                
            {currentOrder.map((originalIndex, visualIndex)=>(
                 <TouchableOpacity 
                    key={originalIndex}
                    style={selectedOption === visualIndex ? styles.selectedOption : styles.option}
                    onPress={withButton ? () => handleItemPress?.(visualIndex) : () => {return}}
                >
                    <Text style={styles.optionText}>{visualIndex+1}. {question.lines[originalIndex]}</Text>
                </TouchableOpacity>
            ))}
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
    container:{
        flex: 1
    },

    scrollView:{
        flex: 1
    },

    questionText:{
        color: 'white',
        fontFamily: 'ActayWide-Bold',
        fontSize: 14,
        marginBottom: 20,
    },

    selectedOption: {
        backgroundColor: '#4D239C',
        borderRadius: 10,
        marginVertical: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: '#6B22F2',
    },

    option: {
        backgroundColor: '#1D1C23',
        borderRadius: 10,
        marginVertical: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: '#6B22F2',
    },

    buttonWrapper:{
        alignItems: 'flex-end',
        marginTop: 20
    },

    optionText:{
        color: 'white',
        fontFamily: 'Actay-Regular',
        fontSize: 12
    }
})