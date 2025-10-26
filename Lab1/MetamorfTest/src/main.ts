type Rule = [string, string];
type SRS = Rule[];

const T_prime: SRS = [
    ['bbb', 'b'],
    ['bab', 'aa'],
    ['aaa', 'aa'],
    ['aab', 'ab'],
    ['aba', 'ab'],
    ['abb', 'aa'],
    ['baa', 'ab'],
    ['baaa', 'aaab'],
    ['abab', 'aabb']
];

interface InvariantCheck {
    name: string;
    value: number;
    valid: boolean;
}

interface RewriteStep {
    word: string;
    step: number;
    ruleApplied?: string;
    invariants: InvariantCheck[];
}

// просто коммент 
class MetamorfT {
    private static countB(word: string): number {
        return (word.match(/b/g) || []).length;
    }

    private static countA(word: string): number {
        return (word.match(/a/g) || []).length;
    }

    //Четность B
    static checkB(word: string, initBParity?: number): { value: number; valid: boolean; initial?: number } {
        let curBParity: number = this.countB(word) % 2;
        
        //костыль чтобы TS не ругался 
        if (initBParity === undefined) {
            return { value: curBParity, valid: true, initial: curBParity };
        }
        
        return { value: curBParity, valid: curBParity === initBParity };
    }

    //Длинна A
    static checkA(word: string, initALengthValue?: number): { value: number; valid: boolean; initial?: number } {
        let countA: number = this.countA(word);
        let length: number = word.length;
        let cur: number = (countA + length) % 2;
        
        //костыль чтобы TS не ругался 
        if (initALengthValue === undefined) {
            return { value: cur, valid: true, initial: cur };
        }
        
        return { value: cur, valid: cur === initALengthValue };
    }

    static genRandomW(length: number): string {
        let result: string = '';
        for (let i: number = 0; i < length; i++) {
            result += Math.random() < 0.5 ? 'a' : 'b';
        }
        return result;
    }

    static randomRule(word: string, srs: SRS): { newWord: string; ruleApplied: string } {
        let appRules: { pattern: string; replacement: string }[] = [];
        
        for (let rule of srs) {
            let [pattern, replacement] = rule;
            if (word.includes(pattern)) {
                appRules.push({ pattern, replacement });
            }
        }
        
        if (appRules.length === 0) {
            return { newWord: word, ruleApplied: 'none' };
        }

        let randomIndex: number = Math.floor(Math.random() * appRules.length);
        let randomRule = appRules[randomIndex];

        //костыль чтобы TS не ругался 
        if (!randomRule) {
            return { newWord: word, ruleApplied: 'none' };
        }

        let { pattern, replacement } = randomRule;
        let positions: number[] = [];
        let pos: number = word.indexOf(pattern);
        while (pos !== -1) {
            positions.push(pos);
            pos = word.indexOf(pattern, pos + 1);
        }

        if (positions.length === 0) {
            return { newWord: word, ruleApplied: 'none' };
        }

        let randomPosIndex: number = Math.floor(Math.random() * positions.length);
        let randomPos: number | undefined = positions[randomPosIndex];
        
        //костыль чтобы TS не ругался 
        if (randomPos === undefined) {
            return { newWord: word, ruleApplied: 'none' };
        }

        let newWord: string = word.substring(0, randomPos) + replacement + word.substring(randomPos + pattern.length);
        
        return { newWord, ruleApplied: `${pattern} → ${replacement}` };
    }


    static GenMetamorf(initialWord: string, srs: SRS, maxSteps: number = 15): RewriteStep[] {
        let sequence: RewriteStep[] = [];
        let currentWord: string = initialWord;
        let initBParity: number = this.checkB(initialWord).value;
        let initALengthValue: number = this.checkA(initialWord).value;

        sequence.push({
            word: currentWord,
            step: 0,
            invariants: [
                {
                    name: "Чётность количества 'b'",
                    value: initBParity,
                    valid: true
                },
                {
                    name: "(count(a) + длина) mod 2",
                    value: initALengthValue,
                    valid: true
                }
            ]
        });

        for (let step: number = 1; step <= maxSteps; step++) {
            let { newWord, ruleApplied } = this.randomRule(currentWord, srs);

            if (newWord === currentWord && ruleApplied === 'none') {
                break;
            }

            currentWord = newWord;

            let bParityCheck = this.checkB(currentWord, initBParity);

            
            let aLengthCheck = this.checkA(currentWord, initALengthValue);

            sequence.push({
                word: currentWord,
                step,
                ruleApplied,
                invariants: [
                    {
                        name: "Чётность количества 'b'",
                        value: bParityCheck.value,
                        valid: bParityCheck.valid
                    },
                    {
                        name: "(count(a) + длина) mod 2",
                        value: aLengthCheck.value,
                        valid: aLengthCheck.valid
                    }
                ]
            });
        }

        return sequence;
    }

    static Tests(testCount: number, maxWordLength: number, maxSteps: number): void {
        let totalPass: number = 0;
        let totalFail: number = 0;

        for (let ind: number = 0; ind < testCount; ind++) {
            console.log(`\nТест ${ind + 1}:`);

            let wordLength: number = Math.floor(Math.random() * (maxWordLength - 3)) + 3;
            let initialWord: string = this.genRandomW(wordLength);
            console.log(`Начальное слово: "${initialWord}"`);

            let sequence: RewriteStep[] = this.GenMetamorf(initialWord, T_prime, maxSteps);

            let testPassed: boolean = true;
            
            for (let step of sequence) {
                console.log(`${step.step}: "${step.word}" ${step.ruleApplied ? `[${step.ruleApplied}]` : ''}`);
                
                for (let invariant of step.invariants) {
                    let status: string = invariant.valid ? 'ok' : 'not ok';
                    console.log(`  ${status} ${invariant.name}: ${invariant.value}`);
                    
                    if (!invariant.valid) {
                        testPassed = false;
                    }
                }
            }

            if (testPassed) {
                console.log(`Тест ${ind + 1} пройден`);
                totalPass++;
            } else {
                console.log(`Тест ${ind + 1} провален`);
                totalFail++;
            }
        }

        if (totalFail === 0) {
            console.log('Тесты пройдены');
        } else {
            console.log('Тесты не пройдены');
        }
    }

}

MetamorfT.Tests(15, 20, 5);