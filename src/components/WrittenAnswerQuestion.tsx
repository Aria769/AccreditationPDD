import {View, Text, TextInput, StyleSheet, ScrollView} from 'react-native'
import {WrittenAnswerQuestion} from "../types/question"
import PushButton from './PushButton';
import { useState, useEffect } from 'react';
import QuestionImageViewer from "./QuestionImageViewer";

type WrittenQuestionProps = {
    question: WrittenAnswerQuestion;
    withButton: boolean; 
    onConfirm?: (answer: any) => void;
    savedAnswer?: string;
    viewedQuestionIndex?: number;
};

export default function WrittenQuestionCard({question, withButton, onConfirm, savedAnswer, viewedQuestionIndex}: WrittenQuestionProps){
    const [answerText, setAnswerText] = useState("");
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [buttonText, setButtonText] = useState("Ответить")
    const [buttonColor, setButtonColor] = useState("#0A99D2")

    const confirmAnswer = () => {
        if (answerText && answerText !== ""){
        setIsConfirmed(true);
        setButtonText("Ответ принят");
        setButtonColor("#125772");
        onConfirm?.(answerText);
        }
        return;
    }

    
    useEffect(() => {
        setAnswerText("");
        setIsConfirmed(false);
        setButtonText("Ответить");
        setButtonColor("#0A99D2");
        if(savedAnswer !== undefined && savedAnswer !== null){
            setAnswerText(savedAnswer);
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
                
                <TextInput 
                            style={styles.input}
                            placeholder='Введите ответ...'
                            placeholderTextColor={'#86868F'}
                            value={answerText}
                            onChangeText={(text) => setAnswerText(text)}
                            editable={!isConfirmed && withButton}
                            />

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
        flex: 1,
    },

    scrollView:{
        flex: 1
    },

    questionText:{
        color: 'white',
        fontFamily: 'ActayWide-Bold',
    },

    input: {
        backgroundColor: '#2B2D3C',
        borderRadius: 10,
        borderColor: '#1D1D20',
        fontFamily: 'Actay-Regular',
        borderWidth: 1,
        color: 'white',
        marginVertical: 20,
        padding: 10
    },

    buttonWrapper:{
        alignItems: 'flex-end',
    },
})