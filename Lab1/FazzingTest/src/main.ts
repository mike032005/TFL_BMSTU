type Rule = [string, string];
type SRS = Rule[];

const T: SRS = [
    ['baaa', 'aaab'],
    ['abab', 'aabb'],
    ['aaab', 'ab'],
    ['bab', 'aa'],
    ['bbb', 'b']
];

// Преобразованная SRS T`
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

class SRSTester {
    //Генерит слуйайную строку заданной длинны
    static genRandomW(length: number): string {
        let result: string = '';
        for (let i: number = 0; i < length; i++) {
            result += Math.random() < 0.5 ? 'a' : 'b';
        }
        return result;
    }


    //Применяет одно случайное правило из SRS к слову
    static appRandRule(word: string, srs: SRS): string {
        // Собираем все применимые правила с их паттернами и заменами
        let applicableRules: { pattern: string; replacement: string }[] = [];
        
        // Находим все применимые правила
        for (let rule of srs) {
            let [pattern, replacement] = rule;
            if (word.includes(pattern)) {
                applicableRules.push({ pattern, replacement });
            }
        }
        
        if (applicableRules.length === 0) {
            return word; // Нет применимых правил
        }

        // Выбираем случайное применимое правило
        let randomRule = applicableRules[Math.floor(Math.random() * applicableRules.length)];
        if (!randomRule) return word; // Костыль чтобы TS не ругался что randomRule может быть undefind
        let { pattern, replacement } = randomRule;

        // Находим все позиции, где можно применить правило
        let positions: number[] = [];
        let pos: number = word.indexOf(pattern);
        while (pos !== -1) {
            positions.push(pos);
            pos = word.indexOf(pattern, pos + 1);
        }
        if (positions.length === 0) {
            return word; // Не должно происходить, но на всякий случай
        }

        // Выбираем случайную позицию для применения
        const randomPos = positions[Math.floor(Math.random() * positions.length)];
        if (!randomPos) return word; //Тоже костыль чтобы TS не ругался что randomRule может быть undefind
        return word.substring(0, randomPos) + replacement + word.substring(randomPos + pattern.length);
    }

    static appRandSequence(word: string, srs: SRS, steps: number): string {
        let current: string = word;
        for (let i: number = 0; i < steps; i++) {
            let next: string = this.appRandRule(current, srs);
            if (next === current) {
                break;
            }
            current = next;
        }
        return current;
    }

    static getNextWords(word: string, srs: SRS): string[] {
        const nextWords: string[] = [];
        for (let [pattern, replacement]of srs) {
            let pos: number = word.indexOf(pattern);
            while (pos !== -1) {
                nextWords.push(word.substring(0, pos) + replacement + word.substring(pos + pattern.length));
                pos = word.indexOf(pattern, pos + 1);
            }
        }
        
        return [...new Set(nextWords)];
    }

    //Проверка достижисоти через bfs
    static canReachBFS(start: string, target: string, srs: SRS, maxDepth: number = 100): boolean {
        if (start === target) return true;
        
        const visited = new Set<string>();
        const queue: string[] = [start];
        visited.add(start);
        
        let depth: number = 0;
        
        while (queue.length > 0 && depth < maxDepth) {
            const currentLevelSize: number = queue.length;
            
            for (let i = 0; i < currentLevelSize; i++) {
                const current: string = queue.shift()!;
                
                const nextWords: string[] = this.getNextWords(current, srs);
                
                for (const next of nextWords) {
                    if (next === target) {
                        return true;
                    }
                    
                    if (!visited.has(next)) {
                        visited.add(next);
                        queue.push(next);
                    }
                }
            }
            
            depth++;
        }
        
        return false;
    }

    static getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    static runEquivalenceTest(): { success: boolean; startWord: string; transformedWord: string; details: string } {
        //Этап 1, формирование случайно переписанной строки 
        const startWord = this.genRandomW(this.getRandomInt(8,15));
        const transformedWord = this.appRandSequence(startWord, T, this.getRandomInt(2,15));
        
        //Этап 2, Проверяем эквивалентность через BFS в T` в две стороны 
        const canReachForward = this.canReachBFS(startWord, transformedWord, T_prime);
        const canReachBackward = this.canReachBFS(transformedWord, startWord, T_prime);
        
        const success = canReachForward || canReachBackward;
        
        return {
            success,
            startWord,
            transformedWord,
            details: `Start: "${startWord}" → T → "${transformedWord}". ` +
                    `Reachable in T': ${canReachForward ? 'forward' : 'NO_FORWARD'} | ${canReachBackward ? 'backward' : 'NO_BACKWARD'}`
        };
    }

    static runTestBatch(count: number): void {
        console.log(`Running ${count} equivalence tests...\n`);
        
        let passed: number = 0;
        let failed: number  = 0;
        
        for (let i: number  = 0; i < count; i++) {
            const result = this.runEquivalenceTest();
            
            if (result.success) {
                passed++;
            } else {
                failed++;
                console.log(`FAILED Test ${i + 1}: ${result.details}`);
            }
        }
        console.log(`Passed: ${passed}/${count} (${((passed / count) * 100).toFixed(1)}%)`);
        console.log(`Failed: ${failed}/${count} (${((failed / count) * 100).toFixed(1)}%)`);
        
        if (failed === 0) {
            console.log(`ALL TESTS PASSED!.`);
        } else {
            console.log(` Some tests failed.`);
        }
    }
}

SRSTester.runTestBatch(500);