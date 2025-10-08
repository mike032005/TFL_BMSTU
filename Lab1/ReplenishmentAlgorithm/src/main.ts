function generateStrings(length: number): string[] {
    const characters: string[] = ['a', 'b'];
    const result: string[] = [];
    
    function generate(current: string): void {
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

const genStr: string[] = generateStrings(6);
console.log(genStr);