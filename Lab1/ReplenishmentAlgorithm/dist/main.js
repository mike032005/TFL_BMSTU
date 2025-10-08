"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateStrings(length) {
    const characters = ['a', 'b'];
    function generate(current) {
        if (current.length === length) {
            console.log(current);
            return;
        }
        for (const char of characters) {
            generate(current + char);
        }
    }
    generate('');
}
generateStrings(6);
//# sourceMappingURL=main.js.map