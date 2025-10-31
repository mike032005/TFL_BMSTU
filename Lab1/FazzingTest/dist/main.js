"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Исходная SRS T
const T = [
    ['baaa', 'aaab'],
    ['aabb', 'abab'],
    ['aaab', 'ab'],
    ['aa', 'bab'],
    ['bbb', 'b']
];
// Преобразованная SRS T`
const T_prime = [
    ['bbb', 'b'],
    ['bab', 'aa'],
    ['aaa', 'aa'],
    ['aab', 'ab'],
    ['aba', 'ab'],
    ['abb', 'aa'],
    ['baa', 'ab']
];
class SRSTester {
    /**
     * Генерирует случайное слово из символов 'a' и 'b'
     */
    static generateRandomWord(length = 25) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.random() < 0.5 ? 'a' : 'b';
        }
        return result;
    }
    /**
     * Применяет одно случайное правило из SRS к слову
     */
    static applyRandomRule(word, srs) {
        // Собираем все применимые правила с их паттернами и заменами
        const applicableRules = [];
        // Находим все применимые правила
        for (const rule of srs) {
            const [pattern, replacement] = rule;
            if (word.includes(pattern)) {
                applicableRules.push({ pattern, replacement });
            }
        }
        if (applicableRules.length === 0) {
            return word; // Нет применимых правил
        }
        // Выбираем случайное применимое правило
        const randomRule = applicableRules[Math.floor(Math.random() * applicableRules.length)];
        if (!randomRule)
            return word;
        const { pattern, replacement } = randomRule;
        // Находим все позиции, где можно применить правило
        const positions = [];
        let pos = word.indexOf(pattern);
        while (pos !== -1) {
            positions.push(pos);
            pos = word.indexOf(pattern, pos + 1);
        }
        if (positions.length === 0) {
            return word; // Не должно происходить, но на всякий случай
        }
        // Выбираем случайную позицию для применения
        const randomPos = positions[Math.floor(Math.random() * positions.length)];
        if (!randomPos)
            return word;
        return word.substring(0, randomPos) + replacement + word.substring(randomPos + pattern.length);
    }
    /**
     * Применяет последовательность случайных правил
     */
    static applyRandomSequence(word, srs, steps = 10) {
        let current = word;
        for (let i = 0; i < steps; i++) {
            const next = this.applyRandomRule(current, srs);
            if (next === current) {
                // Не смогли применить правило, останавливаемся
                break;
            }
            current = next;
        }
        return current;
    }
    /**
     * Находит все слова, достижимые из данного за один шаг по SRS
     */
    static getNextWords(word, srs) {
        const nextWords = [];
        for (const [pattern, replacement] of srs) {
            let pos = word.indexOf(pattern);
            while (pos !== -1) {
                const newWord = word.substring(0, pos) + replacement + word.substring(pos + pattern.length);
                nextWords.push(newWord);
                pos = word.indexOf(pattern, pos + 1);
            }
        }
        return [...new Set(nextWords)]; // Убираем дубликаты
    }
    /**
     * Проверяет, достижимо ли target из start с помощью BFS
     */
    static canReachBFS(start, target, srs, maxDepth = 100) {
        if (start === target)
            return true;
        const visited = new Set();
        const queue = [start];
        visited.add(start);
        let depth = 0;
        while (queue.length > 0 && depth < maxDepth) {
            const currentLevelSize = queue.length;
            for (let i = 0; i < currentLevelSize; i++) {
                const current = queue.shift();
                const nextWords = this.getNextWords(current, srs);
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
    /**
     * Запускает один тест эквивалентности
     */
    static runEquivalenceTest() {
        // 1. Генерируем случайное слово
        const startWord = this.generateRandomWord(25);
        // 2. Применяем случайную последовательность правил из T
        const transformedWord = this.applyRandomSequence(startWord, T, 15);
        // 3. Проверяем эквивалентность через BFS в T`
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
    /**
     * Запускает батарею тестов
     */
    static runTestBatch(count = 100) {
        console.log(`Running ${count} equivalence tests...\n`);
        let passed = 0;
        let failed = 0;
        for (let i = 0; i < count; i++) {
            const result = this.runEquivalenceTest();
            if (result.success) {
                passed++;
            }
            else {
                failed++;
                console.log(`FAILED Test ${i + 1}: ${result.details}`);
            }
            if ((i + 1) % 10 === 0) {
                console.log(`Progress: ${i + 1}/${count} tests completed`);
            }
        }
        console.log(`\n=== RESULTS ===`);
        console.log(`Passed: ${passed}/${count} (${((passed / count) * 100).toFixed(1)}%)`);
        console.log(`Failed: ${failed}/${count} (${((failed / count) * 100).toFixed(1)}%)`);
        if (failed === 0) {
            console.log(`🎉 ALL TESTS PASSED! The SRS appear to be equivalent.`);
        }
        else {
            console.log(`❌ Some tests failed. The SRS may not be equivalent.`);
        }
    }
}
// Запускаем тестирование
SRSTester.runTestBatch(100);
//# sourceMappingURL=main.js.map