import {Question} from './question';


export type Subject = {
    id: string;
    name: string;
    questions: Question[];
}

export type TestData = {
    subjects: Subject[];
}