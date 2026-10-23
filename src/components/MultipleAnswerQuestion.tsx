import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Image} from 'react-native'
import {MultipleAnswerQuestion} from "../types/question"
import { useState, useEffect } from 'react';
import PushButton from './PushButton';
import QuestionImageViewer from "./QuestionImageViewer"; 

type MultipleQuestionProps = {
    question: MultipleAnswerQuestion;
    withButton: boolean;
    onConfirm?: (answer: any) => void;
    savedAnswer?: number[];
    viewedQuestionIndex?: number;
};

export default function MultipleQuestionCard({question, withButton, onConfirm, savedAnswer, viewedQuestionIndex}: MultipleQuestionProps){
    
    const [selectedOption, setSelection] = useState<number[]>([]);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [buttonText, setButtonText] = useState("Ответить")
    const [buttonColor, setButtonColor] = useState("#0A99D2")
    
    const confirmAnswer = () => {
        if (selectedOption && selectedOption.length != 0){
        setIsConfirmed(true);
        setButtonText("Ответ принят");
        setButtonColor("#125772");
        onConfirm?.(selectedOption);
        }
        return;
    }
    
    const setSelectedOption = (index: number) => {
        if(!selectedOption.includes(index)){
            setSelection([...selectedOption, index]);
        }
        else{
            setSelection(selectedOption.filter(item => item !== index));
        }
        return;
    }
    
        
    useEffect(() => {
        setSelection([]);
        setIsConfirmed(false);
        setButtonText("Ответить");
        setButtonColor("#0A99D2");
        if(savedAnswer && savedAnswer?.length !== 0){
            setSelection([...savedAnswer]);
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
            <Text style={styles.questionText}>
                {viewedQuestionIndex !== undefined ? viewedQuestionIndex : question.id}. {question.text}
            </Text>

            <QuestionImageViewer uri={question.img} />

            {question.options.map((option, index)=>(
                 <TouchableOpacity 
                    key={index}
                    style={
                        selectedOption?.includes(index) && withButton
                            ? styles.selectedOption 
                            : styles.option
                    }
                    onPress={withButton ? () => setSelectedOption?.(index) : () => {return}}
                    disabled={isConfirmed}
                >
                    <Image source={selectedOption.includes(index) ? 
                                            require('../media/checkListChecked.png') :
                                            require('../media/checkListUnchecked.png')} 
                                                    style={styles.img}/>
                    <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
            ))}
            {withButton && <View  style={styles.buttonWrapper}><PushButton text={buttonText} 
                                    backgroundColor={buttonColor}
                                    onPush={confirmAnswer}
                                    disabled={selectedOption.length === 0 || isConfirmed}/></View>}
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
        fontFamily: 'ActayWide-Bold',
        color: 'white',
        fontSize: 14,
        marginBottom: 10,
    },

    selectedOption: {
        marginVertical: 5,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 1
    },

    option: {
        marginVertical: 5,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 1
    },

    optionText:{
        fontFamily: 'Actay-Regular',
        color: 'white',
        fontSize: 14
    },

    img: {
        height: 24,
        width: 24,
        resizeMode: 'contain'
    },
    buttonWrapper:{
        alignItems: 'flex-end',
        marginTop: 15
    }
})