import SingleAnswerQuestionCard from "./SingleAnswerQuestion"
import MultipleAnswerQuestionCard from "./MultipleAnswerQuestion"
import WrittenAnswerQuestionCard from "./WrittenAnswerQuestion"
import MatchingQuestionCard from "./MatchingQuestion"
import SequenceQuestionCard from "./SequenceQuestion"

import { Question } from "@/types/question"

type QuestionCardProps = {
    question: Question;
    withButton: boolean;
    onConfirm?: (answer: any) => void;
    savedAnswer?: any;
    viewedQuestionIndex?: number;
}


export default function QuestionCard({question, withButton, onConfirm, savedAnswer, viewedQuestionIndex} : QuestionCardProps){
    const handleAnswer = onConfirm;
    
    if (question.type === "single-answer-question") return(
            <SingleAnswerQuestionCard question={question} onConfirm={handleAnswer} withButton={withButton} savedAnswer={savedAnswer} viewedQuestionIndex={viewedQuestionIndex}/>
    )
    else if (question.type === "multiple-answer-question") return(
            <MultipleAnswerQuestionCard question={question} onConfirm={handleAnswer} withButton={withButton} savedAnswer={savedAnswer} viewedQuestionIndex={viewedQuestionIndex}/>
    )
    else if (question.type === "written-answer-question") return(
            <WrittenAnswerQuestionCard question={question} onConfirm={handleAnswer} withButton={withButton} savedAnswer={savedAnswer} viewedQuestionIndex={viewedQuestionIndex}/>
    )
    else if (question.type === "matching-question") return(
            <MatchingQuestionCard question={question} onConfirm={handleAnswer} withButton={withButton} savedAnswer={savedAnswer} viewedQuestionIndex={viewedQuestionIndex}/>
    )
    else if (question.type === "sequence-question") return(
            <SequenceQuestionCard question={question} onConfirm={handleAnswer} withButton={withButton} savedAnswer={savedAnswer} viewedQuestionIndex={viewedQuestionIndex}/>
    )
}
