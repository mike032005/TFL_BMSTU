"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Генерим все возможные строки заданной длинны
function generateStrings(length) {
    const characters = ['a', 'b'];
    const result = [];
    function generate(current) {
        if (current.length === length) {
            result.push(current);
            return;
        }
        for (const char of characters) {
            generate(current + char);
        }
    }
    generate('');
    return result;
}
// Все имеющиеся правила переписывание, приходится вручную добавлять, тк не знаю как оптимизировать. Правила которые в коментариях это те которые отпали после минимизации 
const Rules = [
    //Это Изначальные правила _______________________________________________
    /*(word: string): string | null => {
        if (word.includes('baaa')) {
            return word.replace('baaa', 'aaab');
        }
        return null;
    },
    (word: string): string | null => {
        if (word.includes('abab')) {
            return word.replace('abab', 'aabb');
        }
        return null;
    },*/
    (word) => {
        if (word.includes('bab')) {
            return word.replace('bab', 'aa');
        }
        return null;
    },
    /*(word: string): string | null => {
        if (word.includes('aaab')) {
            return word.replace('aaab', 'ab');
        }
        return null;
    },*/
    (word) => {
        if (word.includes('bbb')) {
            return word.replace('bbb', 'b');
        }
        return null;
    },
    //Это пополненые по алгоритму Кнуту–Бендиксу правила _________________________________________________________
    (word) => {
        if (word.includes('aaa')) {
            return word.replace('aaa', 'aa');
        }
        return null;
    },
    (word) => {
        if (word.includes('abb')) {
            return word.replace('abb', 'aa');
        }
        return null;
    },
    /*(word: string): string | null => {
        if (word.includes('bbaa')) {
            return word.replace('bbaa', 'aa');
        }
        return null;
    },*/
    (word) => {
        if (word.includes('aab')) {
            return word.replace('aab', 'ab');
        }
        return null;
    },
    (word) => {
        if (word.includes('baa')) {
            return word.replace('baa', 'ab');
        }
        return null;
    },
    (word) => {
        if (word.includes('aba')) {
            return word.replace('aba', 'ab');
        }
        return null;
    },
    /*(word: string): string | null => {
        if (word.includes('abaa')) {
            return word.replace('abaa', 'ab');
        }
        return null;
    },
    (word: string): string | null => {
        if (word.includes('aabb')) {
            return word.replace('aabb', 'aaa');
        }
        return null;
    }*/
];
// Эта функция принимает одно слово и возвращает все его вариации переписывания 
function AllRewrites(word) {
    const res = [];
    for (const rule of Rules) {
        const result = rule(word);
        if (result !== null) {
            res.push(result);
        }
    }
    return res;
}
function NormForm(startWord) {
    const normalForms = new Set();
    const queue = [startWord];
    while (queue.length > 0) {
        const cur = queue.shift();
        const rewrites = AllRewrites(cur);
        if (rewrites.length === 0) {
            normalForms.add(cur);
        }
        else {
            queue.push(...rewrites);
        }
    }
    return Array.from(normalForms);
}
// Основная функция
function processAllWords() {
    const genStr = generateStrings(11);
    for (const word of genStr) {
        console.log(word);
        const normalForms = NormForm(word);
        if (normalForms.length > 1) {
            console.log(`Слово: ${word} -> Нормальные формы: [${[normalForms]}]`);
        }
    }
}
processAllWords();
//# sourceMappingURL=main.js.map