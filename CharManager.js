import { CharInput, CHAR_INPUT_STATUS } from './CharInput.js';
import { ALPH_TYPES } from './index.js';

/**
 * Represents a class that manages the character input elements.
 */
export class CharManager {
    #charInputs;
    #alph;
    #prefiltered;
    #words;
    /**
     * Create a new `CharManager`
     */
    constructor(words = 5, chars = 5, alphType = 0, parent = document.body) {
        const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', NUMS = '1234567890', MATH = '!()*+-./<=>^',
            ALLOW_ALPH = alphType === ALPH_TYPES.ALPH_NUMS || alphType === ALPH_TYPES.ALPH_ONLY,
            ALLOW_NUMS = alphType === ALPH_TYPES.ALPH_NUMS || alphType === ALPH_TYPES.NUMS_MATH || alphType === ALPH_TYPES.NUMS_ONLY,
            ALLOW_MATH = alphType === ALPH_TYPES.NUMS_MATH;
        this.#alph = (ALLOW_ALPH ? ALPH : '') + (ALLOW_NUMS ? NUMS : '') + (ALLOW_MATH ? MATH : '');
        this.#prefiltered = this.#alph;
        this.#charInputs = [];
        this.#words = [];
        for (let w = 0; w < words; w++) {
            const WORD_DIV = document.createElement('div');
            WORD_DIV.setAttribute('class', 'word');
            this.#charInputs[w] = [];
            for (let c = 0; c < chars; c++) {
                this.#charInputs[w][c] = new CharInput(this.#alph, WORD_DIV);
            }
            parent.appendChild(WORD_DIV);
        }
    }
    /**
     * Generate an array of characters that are valid for a certain position in the word.
     */
    #generateValidCharsForPosition(c) {
        let alph = this.#prefiltered;
        for (let w in this.#charInputs) {
            const input = this.#charInputs[w][c];
            if (input instanceof CharInput) {
                if (input.hasValue()) {
                    if (input.getStatus() === CHAR_INPUT_STATUS.CORRECT) {
                        return [input.getChar()];
                    } else if (input.getStatus() === CHAR_INPUT_STATUS.INCORRECT_PLACEMENT) {
                        alph = alph.replace(input.getChar(), '');
                    }
                }
            } else {
                return [];
            }
        }
        return [...alph];
    }
    /**
     * Apply a pre-filter to the alphabet to get rid of characters that do not appear in the word.
     */
    #prefilter() {
        this.#prefiltered = this.#alph;
        for (let w in this.#charInputs) {
            for (let c in this.#charInputs[w]) {
                const input = this.#charInputs[w][c];
                if (input instanceof CharInput && input.hasValue() && input.getStatus() === CHAR_INPUT_STATUS.INCORRECT) {
                    this.#prefiltered = this.#prefiltered.replace(input.getChar(), '');
                }
            }
        }
    }
    /**
     * Generate an array of characters that are required in the word but are not in the correct position.
     */
    #getRequiredCharacters() {
        const req = [];
        for (let w in this.#charInputs) {
            for (let c in this.#charInputs[w]) {
                const input = this.#charInputs[w][c];
                if (input instanceof CharInput && input.hasValue() && input.getStatus() === CHAR_INPUT_STATUS.INCORRECT_PLACEMENT) {
                    req.push(input.getChar());
                }
            }
        }
        return req;
    }
    /**
     * Clear all user input.
     */
    clearInput() {
        for (let w in this.#charInputs) {
            for (let c in this.#charInputs[w]) {
                this.#charInputs[w][c].clear();
            }
        }
    }
    /**
     * Return a list of all possible character combinations for the input specified.
     */
    generate() {
        this.#words = [];
        this.#prefilter();
        this.#buildWords();
        const requiredChars = this.#getRequiredCharacters();
        requiredChars.forEach(char => {
            this.#words = this.#words.filter(x => x.includes(char));
        });
        return this.#words;
    }
    /**
     * Generate the complete list of possible character combinations.
     */
    #buildWords(word = '', char = 0) {
        const chars = this.#generateValidCharsForPosition(char);
        if (!chars.length) {
            this.#words.push(word);
            return;
        }
        for (let c in chars) {
            this.#buildWords(word + chars[c], char + 1);
        }
    }
}