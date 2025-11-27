interface DFATransitions {
    [state: number]: {
        [symbol: string]: number;
    };
}

interface NFATransitions {
    [state: string]: {
        [symbol: string]: Set<string>;
    };
}

class DFA {
    private readonly transitions: Map<number, Map<string, number>>;
    private readonly startState: number = 0;
    private readonly acceptStates: Set<number>;

    constructor() {
        const transitionTable: DFATransitions = {
            0: { a: 1, b: 2, c: 3 },
            1: { a: 12, b: 25, c: 3 },
            2: { a: 3, b: 4, c: 5 },
            3: { a: 3, b: 3, c: 3 },
            4: { a: 11, b: 2, c: 3 },
            5: { a: 6, b: 3, c: 3 },
            6: { a: 7, b: 8, c: 3 },
            7: { a: 3, b: 9, c: 3 },
            8: { a: 3, b: 3, c: 5 },
            9: { a: 3, b: 3, c: 6 },
            11: { a: 12, b: 13, c: 3 },
            12: { a: 11, b: 2, c: 21 },
            13: { a: 14, b: 3, c: 15 },
            14: { a: 24, b: 3, c: 3 },
            15: { a: 16, b: 17, c: 3 },
            16: { a: 3, b: 9, c: 21 },
            17: { a: 14, b: 3, c: 18 },
            18: { a: 19, b: 20, c: 3 },
            19: { a: 7, b: 8, c: 21 },
            20: { a: 14, b: 3, c: 21 },
            21: { a: 22, b: 20, c: 3 },
            22: { a: 3, b: 3, c: 21 },
            24: { a: 3, b: 3, c: 3 },
            25: { a: 14, b: 3, c: 15 }
        };

        this.transitions = new Map();
        this.setupTransitions(transitionTable);
        
        this.acceptStates = new Set([0, 1, 2, 4, 7, 11, 12, 16, 24, 25]);
    }

    private setupTransitions(transitionTable: DFATransitions): void {
        for (const [stateStr, symbols] of Object.entries(transitionTable)) {
            const state: number = parseInt(stateStr);
            const stateMap: Map<string, number> = new Map();
            
            for (const [symbol, nextState] of Object.entries(symbols)) {
                stateMap.set(symbol, nextState as number);
            }
            
            this.transitions.set(state, stateMap);
        }
    }

    checkWord(input: string): boolean {
        let currentState: number = this.startState;
        
        for (const char of input) {
            const stateTransitions: Map<string, number> | undefined = this.transitions.get(currentState);
            if (!stateTransitions) return false;
            
            const nextState: number | undefined = stateTransitions.get(char);
            if (nextState === undefined) return false;
            
            currentState = nextState;
        }

        return this.acceptStates.has(currentState);
    }
}

class NFA {
    private readonly transitions: Map<string, Map<string, Set<string>>>;
    private readonly startState: string = "q0";
    private readonly acceptStates: Set<string>;

    constructor() {
        this.transitions = new Map();
        this.acceptStates = new Set(["q0", "q2", "q4", "q5", "q20", "q22"]);
        
        this.setupNFATransitions();
    }

    private setupNFATransitions(): void {
        const states: string[] = [
            "q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9",
            "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19",
            "q20", "q21", "q22"
        ];

        for (const state of states) {
            this.transitions.set(state, new Map());
        }

        this.addStateTransition("q0", "a", ["q1", "q6", "q7", "q14", "q20", "q21"]);
        this.addStateTransition("q0", "b", ["q3", "q5", "q17"]);

        this.addStateTransition("q1", "a", ["q2"]);
        this.addStateTransition("q2", "a", ["q1", "q6", "q7", "q14", "q20"]);
        this.addStateTransition("q2", "b", ["q3", "q5", "q17"]);

        this.addStateTransition("q3", "b", ["q4"]);
        this.addStateTransition("q4", "a", ["q1", "q6", "q7", "q14", "q20"]);
        this.addStateTransition("q4", "b", ["q3", "q5", "q17"]);

        this.addStateTransition("q5", "b", ["q5"]);

        this.addStateTransition("q6", "a", ["q20"]);

        this.addStateTransition("q7", "a", ["q10"]);
        this.addStateTransition("q7", "b", ["q8", "q12"]);

        this.addStateTransition("q8", "c", ["q9"]);
        this.addStateTransition("q9", "a", ["q10"]);
        this.addStateTransition("q9", "b", ["q8", "q12"]);

        this.addStateTransition("q10", "c", ["q11"]);
        this.addStateTransition("q11", "a", ["q10"]);
        this.addStateTransition("q11", "b", ["q8", "q12"]);

        this.addStateTransition("q12", "a", ["q13"]);
        this.addStateTransition("q13", "a", ["q20"]);

        this.addStateTransition("q14", "b", ["q15"]);
        this.addStateTransition("q15", "c", ["q16"]);
        this.addStateTransition("q16", "a", ["q14", "q20"]);
        this.addStateTransition("q16", "b", ["q17"]);

        this.addStateTransition("q17", "c", ["q18"]);
        this.addStateTransition("q18", "a", ["q19"]);
        this.addStateTransition("q19", "a", ["q14", "q20"]);
        this.addStateTransition("q19", "b", ["q17"]);

        this.addStateTransition("q21", "b", ["q22"]);
    }

    private addStateTransition(fromState: string, symbol: string, toStates: string[]): void {
        const fromTransitions: Map<string, Set<string>> | undefined = this.transitions.get(fromState);
        if (!fromTransitions) return;

        if (!fromTransitions.has(symbol)) {
            fromTransitions.set(symbol, new Set());
        }
        
        const transitionSet: Set<string> = fromTransitions.get(symbol)!;
        for (const toState of toStates) {
            transitionSet.add(toState);
        }
    }

    checkWord(input: string): boolean {
        let currentStates: Set<string> = new Set([this.startState]);
        
        for (const char of input) {
            const nextStates: Set<string> = new Set();
            
            for (const state of currentStates) {
                const stateTransitions: Map<string, Set<string>> | undefined = this.transitions.get(state);
                if (!stateTransitions) continue;
                
                const symbolTransitions: Set<string> | undefined = stateTransitions.get(char);
                if (!symbolTransitions) continue;
                
                for (const nextState of symbolTransitions) {
                    nextStates.add(nextState);
                }
            }
            
            currentStates = nextStates;
            if (currentStates.size === 0) break;
        }

        for (const state of currentStates) {
            if (this.acceptStates.has(state)) {
                return true;
            }
        }
        
        return false;
    }
}

interface SimpleAutomaton {
    transitions: Map<number, Map<string, number>>;
    acceptStates: Set<number>;
    startState: number;
}

class AFA {
    private readonly automata: {
        first: DFA;
        second: SimpleAutomaton;
        third: SimpleAutomaton;
    };

    constructor() {
        this.automata = {
            first: new DFA(),
            second: this.buildSecondAutomaton(),
            third: this.buildThirdAutomaton()
        };
    }

    private buildSecondAutomaton(): SimpleAutomaton {
        const transitions: Map<number, Map<string, number>> = new Map([
            [26, new Map([['a', 27], ['b', 28], ['c', 30]])],
            [27, new Map([['a', 26], ['b', 30], ['c', 30]])],
            [28, new Map([['a', 30], ['b', 29], ['c', 30]])],
            [29, new Map([['a', 27], ['b', 28], ['c', 30]])],
            [30, new Map([['a', 30], ['b', 30], ['c', 30]])]
        ]);

        const acceptStates: Set<number> = new Set([26, 28, 29]);

        return { transitions, acceptStates, startState: 26 };
    }

    private buildThirdAutomaton(): SimpleAutomaton {
        const transitions: Map<number, Map<string, number>> = new Map([
            [60, new Map([['a', 61], ['b', 62], ['c', 63]])],
            [61, new Map([['a', 64], ['b', 65], ['c', 63]])],
            [62, new Map([['a', 63], ['b', 60], ['c', 63]])],
            [63, new Map([['a', 63], ['b', 63], ['c', 63]])],
            [64, new Map([['a', 61], ['b', 62], ['c', 66]])],
            [65, new Map([['a', 67], ['b', 63], ['c', 63]])],
            [66, new Map([['a', 68], ['b', 65], ['c', 63]])],
            [67, new Map([['a', 63], ['b', 63], ['c', 63]])],
            [68, new Map([['a', 63], ['b', 63], ['c', 66]])]
        ]);

        const acceptStates: Set<number> = new Set([67]);

        return { transitions, acceptStates, startState: 60 };
    }

    private runAutomaton(automaton: SimpleAutomaton, input: string): boolean {
        let currentState: number = automaton.startState;
        
        for (const char of input) {
            const stateTransitions: Map<string, number> | undefined = automaton.transitions.get(currentState);
            if (!stateTransitions) return false;
            
            const nextState: number | undefined = stateTransitions.get(char);
            if (nextState === undefined) return false;
            
            currentState = nextState;
        }

        return automaton.acceptStates.has(currentState);
    }

    checkWord(input: string): boolean {
        const firstResult: boolean = this.automata.first.checkWord(input);
        const secondResult: boolean = this.runAutomaton(this.automata.second, input);
        const thirdResult: boolean = this.runAutomaton(this.automata.third, input);

        const acceptCount: number = [firstResult, secondResult, thirdResult].filter(Boolean).length;
        
        return acceptCount >= 2;
    }

    getDetailedResults(input: string): {
        word: string;
        firstResult: boolean;
        secondResult: boolean;
        thirdResult: boolean;
        finalResult: boolean;
    } {
        const firstResult: boolean = this.automata.first.checkWord(input);
        const secondResult: boolean = this.runAutomaton(this.automata.second, input);
        const thirdResult: boolean = this.runAutomaton(this.automata.third, input);
        
        const acceptCount: number = [firstResult, secondResult, thirdResult].filter(Boolean).length;
        const finalResult: boolean = acceptCount >= 2;

        return {
            word: input,
            firstResult,
            secondResult,
            thirdResult,
            finalResult
        };
    }
}

class WordGenerator {
    static generateWord(maxLength: number = 20): string {
        const letters: string[] = ['a', 'b', 'c'];
        const length: number = Math.floor(Math.random() * maxLength) + 1;
        let result: string = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex: number = Math.floor(Math.random() * letters.length);
            result += letters[randomIndex];
        }
        
        return result;
    }

    static generateWords(count: number, maxLength: number = 20): string[] {
        const words: string[] = [];
        for (let i = 0; i < count; i++) {
            words.push(this.generateWord(maxLength));
        }
        return words;
    }
}

class AutomataTester {
    private readonly dfa: DFA;
    private readonly nfa: NFA;
    private readonly afa: AFA;

    constructor() {
        this.dfa = new DFA();
        this.nfa = new NFA();
        this.afa = new AFA();
    }

    testSingleWord(word: string): { 
        word: string; 
        nfaResult: boolean; 
        dfaResult: boolean; 
        match: boolean 
    } {
        const nfaResult: boolean = this.nfa.checkWord(word);
        const dfaResult: boolean = this.dfa.checkWord(word);
        
        return {
            word,
            nfaResult,
            dfaResult,
            match: nfaResult === dfaResult
        };
    }

    testafaWord(word: string): ReturnType<AFA['getDetailedResults']> {
        return this.afa.getDetailedResults(word);
    }

    runTests(wordCount: number = 10, maxLength: number = 20): {
        comparisonResults: Array<ReturnType<AutomataTester['testSingleWord']>>,
        afaResults: Array<ReturnType<AFA['getDetailedResults']>>
    } {
        const words: string[] = WordGenerator.generateWords(wordCount, maxLength);
        
        const comparisonResults: Array<ReturnType<AutomataTester['testSingleWord']>> = [];
        const afaResults: Array<ReturnType<AFA['getDetailedResults']>> = [];
        
        for (const word of words) {
            comparisonResults.push(this.testSingleWord(word));
            afaResults.push(this.testafaWord(word));
        }
        
        return { comparisonResults, afaResults };
    }

    findDifference(maxTests: number = 1000): ReturnType<AutomataTester['testSingleWord']> | null {
        for (let i = 0; i < maxTests; i++) {
            const word: string = WordGenerator.generateWord(20);
            const result = this.testSingleWord(word);
            
            if (!result.match) {
                return result;
            }
        }
        
        return null;
    }
}

function runDemo(): void {
    const tester: AutomataTester = new AutomataTester();

    console.log('=== СРАВНЕНИЕ ДКА И НКА ===');
    console.log('Генерируем случайные слова для тестирования...\n');

    const testData = tester.runTests(6, 12);

    console.log('Результаты сравнения:');
    console.log('Слово'.padEnd(15) + 'НКА'.padEnd(8) + 'ДКА'.padEnd(8) + 'Совпадение');
    console.log('-'.repeat(45));
    
    testData.comparisonResults.forEach(result => {
        console.log(
            `"${result.word}"`.padEnd(15) +
            (result.nfaResult ? 'Да' : 'Нет').padEnd(8) +
            (result.dfaResult ? 'Да' : 'Нет').padEnd(8) +
            (result.match ? 'ДА' : 'НЕТ')
        );
    });

    console.log('\n=== ПОИСК РАСХОЖДЕНИЙ ===');
    const difference = tester.findDifference(5000);
    
    if (difference) {
        console.log('Найдено расхождение между ДКА и НКА:');
        console.log(`Слово: "${difference.word}"`);
        console.log(`НКА: ${difference.nfaResult ? 'принял' : 'отклонил'}`);
        console.log(`ДКА: ${difference.dfaResult ? 'принял' : 'отклонил'}`);
    } else {
        console.log('Расхождений не найдено (проверено 5000 слов)');
    }

    console.log('\n=== ТЕСТИРОВАНИЕ ПКА ===');
    const testWords: string[] = ['a', 'b', 'ab', 'ba', 'aa', 'bb', 'abc', 'aaa', 'baa'];
    
    testWords.forEach(word => {
        const result = tester.testafaWord(word);
        console.log(
            `"${word}"`.padEnd(10) +
            `Авт1:${result.firstResult ? 'Да' : 'Нет'}`.padEnd(10) +
            `Авт2:${result.secondResult ? 'Да' : 'Нет'}`.padEnd(10) +
            `Авт3:${result.thirdResult ? 'Да' : 'Нет'}`.padEnd(12) +
            `Итог: ${result.finalResult ? 'ПРИНЯТО' : 'ОТКЛОНЕНО'}`
        );
    });
}

runDemo();