export type Question = SingleAnswerQuestion | MultipleAnswerQuestion | WrittenAnswerQuestion | MatchingQuestion | SequenceQuestion;

export type QuestionType = 'single-answer-question' | 'multiple-answer-question' | 'written-answer-question' | 'matching-question' | 'sequence-question'

export type BaseQuestion = {
    id: number;
    type: QuestionType;
    text: string;
    img?: string;
}

export type SingleAnswerQuestion = BaseQuestion & {
    options: string[];
    correctAnswer: number;
}

export type MultipleAnswerQuestion = BaseQuestion & {
    options: string[];
    correctAnswer: number[];
}

export type WrittenAnswerQuestion = BaseQuestion & {
    correctAnswer: string[];
}

export type MatchingQuestion = BaseQuestion & {
    optionsLeft: string[];
    optionsRight: string[];
    correctAnswer: number[];
}

export type SequenceQuestion = BaseQuestion & {
    lines: string[];
    correctAnswer: number[];
}

const allQuestions: Question[] = []