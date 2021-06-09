import mustache = require('mustache');
import fs = require('fs');
import path = require('path');


function randomInt(a: number, b: number) {
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomChar() {
    return randomInt(10, 10 + 25).toString(36);
}

function randomizeArray<T>(arr: T[]): T[] {
    return arr.sort(() => 0.5 - Math.random());
}

function randomElement<T>(arr: T[]): T {
    return arr[randomInt(0, arr.length - 1)];
}

const template: string = fs.readFileSync(path.resolve(__dirname, "questions.mst"), 'utf8');

type Answer = {
    text: string,
    fraction?: string,
    feedback?: string
}

type Question = {
    qtype: "cloze" | "shortanswer" | "truefalse" | "multichoice",
    name: string,
    text: string,
    answers: Answer[]
}

type QuestionCategory = {
    name: string,
    questions: Question[];
}

function createQuestions(name: string, n: number, qtype: "cloze" | "shortanswer", genQuestion: () => { name?: string, text: string, answers?: string[] }) {
    const questions: Question[] = [];
    for (let i = 0; i < n; i++) {
        const question = genQuestion();
        questions.push({
            qtype: qtype,
            name: question.name || name,
            text: question.text.replace(/\n/g, '<br />'),
            answers: (question.answers) ? (question.answers.map((answerstr) => new Object({ text: answerstr }) as Answer)) : []
        });
    }
    return { name: name, questions: questions } as QuestionCategory;
}

function createYesNoQuestions(name: string, text: string, statements: Record<string, boolean>) {
    const questions: Question[] = [];
    for (const statement of Object.keys(statements)) {
        questions.push({
            qtype: "truefalse",
            name: name,
            text: text.replace(/\n/g, '<br />') + '<br />' + statement,
            answers: [{ text: "Wahr", fraction: statements[statement] ? "100" : "0" },
            { text: "Falsch", fraction: statements[statement] ? "0" : "100", feedback: "Falsch" }]
        });
    }
    return { name: name, questions: questions } as QuestionCategory;
}

function createMultiChoice(name: string, text: string, statements: Record<string, boolean | string[]>) {
    const questions: Question[] = [];
    for (const statement of Object.keys(statements)) {
        let answers: Answer[];
        if (typeof statements[statement] === "boolean") {
            answers = [
                { text: "Wahr", fraction: statements[statement] ? "100" : "0", feedback: "" },
                { text: "Falsch", fraction: statements[statement] ? "0" : "100", feedback: "" }];
        } else {
            const choices = statements[statement] as string[];
            answers = choices.map((choice) => {
                if (choice.startsWith("=")) {
                    return { text: choice.substr(1), fraction: "100" };
                } else {
                    return { text: choice, fraction: "0" };
                }
            });
        }
        questions.push({
            qtype: "multichoice",
            name: name,
            text: text.replace(/\n/g, '<br />') + '<br />' + statement,
            answers: answers
        });
    }
    return { name: name, questions: questions } as QuestionCategory;
}

// let id = 100000;
// console.log(mustache.render(template, {
//     categories: categories,
//     nextid: () => id++
// }));
