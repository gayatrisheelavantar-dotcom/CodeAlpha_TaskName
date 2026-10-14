/* =========================================================
   LINGO
   REAL-TIME LANGUAGE ANALYZER
   ========================================================= */


/* =========================================================
   LANGUAGE INFORMATION
   ========================================================= */

const LANGUAGES = {

    en: {
        name: "English",
        native: "English",
        speech: "en-IN"
    },

    hi: {
        name: "Hindi",
        native: "हिन्दी",
        speech: "hi-IN"
    },

    kn: {
        name: "Kannada",
        native: "ಕನ್ನಡ",
        speech: "kn-IN"
    }

};


/* =========================================================
   APP STATE
   ========================================================= */

let detectedCode = "en";

let translationRequest = 0;

let analysisTimer = null;


/* =========================================================
   GET ELEMENTS
   ========================================================= */

const sourceText =
    document.getElementById("sourceText");

const targetLanguage =
    document.getElementById("targetLanguage");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const clearBtn =
    document.getElementById("clearBtn");

const listenInput =
    document.getElementById("listenInput");

const listenTranslation =
    document.getElementById("listenTranslation");

const copyTranslation =
    document.getElementById("copyTranslation");

const charCount =
    document.getElementById("charCount");

const detectedLanguage =
    document.getElementById("detectedLanguage");

const translationResult =
    document.getElementById("translationResult");

const status =
    document.getElementById("status");

const analysisLanguage =
    document.getElementById("analysisLanguage");

const wordCount =
    document.getElementById("wordCount");

const analysisCharacters =
    document.getElementById("analysisCharacters");

const sentenceType =
    document.getElementById("sentenceType");

const sentenceStructure =
    document.getElementById("sentenceStructure");

const keywords =
    document.getElementById("keywords");


/* =========================================================
   INPUT EVENT
   ========================================================= */

sourceText.addEventListener(
    "input",
    function () {

        updateCharacterCount();

        clearTimeout(analysisTimer);

        const text =
            sourceText.value.trim();


        if (!text) {

            resetResults();

            return;
        }


        /*
         * Wait 700 milliseconds after
         * typing stops.
         */

        analysisTimer =
            setTimeout(
                analyzeSentence,
                700
            );

    }
);


/* =========================================================
   ANALYZE BUTTON
   ========================================================= */

analyzeBtn.addEventListener(
    "click",
    analyzeSentence
);


/* =========================================================
   TARGET LANGUAGE CHANGE
   ========================================================= */

targetLanguage.addEventListener(
    "change",
    function () {

        if (
            sourceText.value.trim()
        ) {

            translateSentence();

        }

    }
);


/* =========================================================
   CLEAR
   ========================================================= */

clearBtn.addEventListener(
    "click",
    function () {

        sourceText.value = "";

        resetResults();

        sourceText.focus();

    }
);


/* =========================================================
   COPY
   ========================================================= */

copyTranslation.addEventListener(
    "click",
    async function () {

        const text =
            translationResult.textContent.trim();


        if (
            !text ||
            text ===
            "Translation will appear here..."
        ) {

            setStatus(
                "There is no translation to copy."
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );

            setStatus(
                "Translation copied successfully."
            );

        } catch (error) {

            setStatus(
                "Could not copy the translation."
            );

        }

    }
);


/* =========================================================
   LISTEN INPUT
   ========================================================= */

listenInput.addEventListener(
    "click",
    function () {

        const text =
            sourceText.value.trim();


        if (!text) {

            setStatus(
                "Enter a sentence first."
            );

            return;
        }


        speak(
            text,
            detectedCode
        );

    }
);


/* =========================================================
   LISTEN TRANSLATION
   ========================================================= */

listenTranslation.addEventListener(
    "click",
    function () {

        const text =
            translationResult.textContent.trim();


        if (
            !text ||
            text ===
            "Translation will appear here..."
        ) {

            setStatus(
                "No translation available."
            );

            return;
        }


        speak(
            text,
            targetLanguage.value
        );

    }
);


/* =========================================================
   MAIN ANALYSIS
   ========================================================= */

async function analyzeSentence() {

    const text =
        sourceText.value.trim();


    if (!text) {

        resetResults();

        return;
    }


    setStatus(
        "Analyzing your sentence..."
    );


    /* Detect language */

    detectedCode =
        detectLanguage(text);


    const detectedName =
        LANGUAGES[detectedCode].name;


    detectedLanguage.textContent =
        `${LANGUAGES[detectedCode].native} - ${detectedName}`;


    analysisLanguage.textContent =
        detectedName;


    /* Basic analysis */

    performLocalAnalysis(
        text,
        detectedCode
    );


    /* Translation */

    await translateSentence();

}


/* =========================================================
   LANGUAGE DETECTION
   ========================================================= */

function detectLanguage(text) {

    /*
     * Kannada Unicode:
     * \u0C80-\u0CFF
     */

    if (
        /[\u0C80-\u0CFF]/.test(text)
    ) {

        return "kn";

    }


    /*
     * Hindi / Devanagari Unicode:
     * \u0900-\u097F
     */

    if (
        /[\u0900-\u097F]/.test(text)
    ) {

        return "hi";

    }


    /*
     * For other text, use English
     * as the default.
     */

    return "en";
}


/* =========================================================
   LOCAL SENTENCE ANALYSIS
   ========================================================= */

function performLocalAnalysis(
    text,
    language
) {

    /* Characters */

    const characters =
        [...text].length;


    analysisCharacters.textContent =
        characters;


    /* Words */

    const words =
        getWords(text);


    wordCount.textContent =
        words.length;


    /* Sentence type */

    const type =
        detectSentenceType(text);


    sentenceType.textContent =
        type;


    /* Structure */

    sentenceStructure.textContent =
        createStructureDescription(
            text,
            words,
            language,
            type
        );


    /* Keywords */

    displayKeywords(
        words,
        language
    );

}


/* =========================================================
   GET WORDS
   ========================================================= */

function getWords(text) {

    return text
        .trim()
        .split(/\s+/)
        .map(
            word =>
                word.replace(
                    /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,
                    ""
                )
        )
        .filter(Boolean);

}


/* =========================================================
   SENTENCE TYPE
   ========================================================= */

function detectSentenceType(text) {

    const trimmed =
        text.trim();


    if (
        trimmed.endsWith("?")
    ) {

        return "Question";

    }


    if (
        trimmed.endsWith("!")
    ) {

        return "Exclamation";

    }


    /*
     * Basic imperative detection.
     */

    const lower =
        trimmed.toLowerCase();


    const imperativeWords = [
        "please",
        "do",
        "don't",
        "dont",
        "stop",
        "go",
        "come",
        "take",
        "give",
        "open",
        "close",
        "tell",
        "write",
        "read",
        "listen"
    ];


    const firstWord =
        lower
            .split(/\s+/)[0]
            ?.replace(
                /[^a-z']/g,
                ""
            );


    if (
        imperativeWords.includes(
            firstWord
        )
    ) {

        return "Command / Request";

    }


    return "Statement";

}


/* =========================================================
   STRUCTURE DESCRIPTION
   ========================================================= */

function createStructureDescription(
    text,
    words,
    language,
    type
) {

    if (!words.length) {

        return "No sentence to analyze.";

    }


    const firstWord =
        words[0];


    const lastWord =
        words[words.length - 1];


    let description =
        `This is a ${type.toLowerCase()}. `;


    description +=
        `It contains ${words.length} word`;


    if (words.length !== 1) {
        description += "s";
    }


    description += ".";


    if (words.length >= 3) {

        description +=
            ` The sentence begins with "${firstWord}" and ends with "${lastWord}".`;

    }


    if (type === "Question") {

        description +=
            " The sentence is asking for information.";

    }


    if (type === "Command / Request") {

        description +=
            " The sentence expresses a request or instruction.";

    }


    if (type === "Exclamation") {

        description +=
            " The sentence expresses strong emotion or emphasis.";

    }


    description +=
        ` Detected language: ${LANGUAGES[language].name}.`;


    return description;

}


/* =========================================================
   KEYWORDS
   ========================================================= */

function displayKeywords(
    words,
    language
) {

    keywords.innerHTML = "";


    /*
     * Common words that are usually
     * not useful as keywords.
     */

    const stopWords = {

        en: new Set([
            "the",
            "a",
            "an",
            "is",
            "am",
            "are",
            "was",
            "were",
            "to",
            "of",
            "in",
            "on",
            "for",
            "and",
            "or",
            "but",
            "i",
            "you",
            "he",
            "she",
            "it",
            "we",
            "they",
            "this",
            "that",
            "my",
            "your"
        ]),

        hi: new Set([
            "है",
            "हैं",
            "था",
            "थी",
            "के",
            "की",
            "का",
            "और",
            "में",
            "से",
            "को",
            "यह",
            "वह",
            "मैं",
            "आप"
        ]),

        kn: new Set([
            "ಇದು",
            "ಅದು",
            "ಮತ್ತು",
            "ನಾನು",
            "ನೀವು",
            "ಅವರು",
            "ನಲ್ಲಿ",
            "ಗೆ",
            "ದ",
            "ಒಂದು"
        ])

    };


    const ignored =
        stopWords[language] ||
        stopWords.en;


    const unique =
        [];


    for (
        const word of words
    ) {

        const clean =
            word.toLowerCase();


        if (
            clean.length < 2
        ) {
            continue;
        }


        if (
            ignored.has(clean)
        ) {
            continue;
        }


        if (
            !unique.includes(word)
        ) {

            unique.push(word);

        }


        if (
            unique.length >= 8
        ) {
            break;
        }

    }


    if (!unique.length) {

        keywords.innerHTML =
            `<span class="empty-keyword">
                No important words found
            </span>`;

        return;
    }


    unique.forEach(
        word => {

            const span =
                document.createElement(
                    "span"
                );


            span.className =
                "keyword";


            span.textContent =
                word;


            keywords.appendChild(
                span
            );

        }
    );

}


/* =========================================================
   TRANSLATION
   ========================================================= */

async function translateSentence() {

    const text =
        sourceText.value.trim();


    if (!text) {
        return;
    }


    const target =
        targetLanguage.value;


    /*
     * If user chooses the same language,
     * no API request is needed.
     */

    if (
        detectedCode === target
    ) {

        translationResult.textContent =
            text;

        setStatus(
            "Analysis complete."
        );

        return;
    }


    /*
     * MyMemory has a 500-byte
     * request limit.
     */

    const byteLength =
        new TextEncoder()
            .encode(text)
            .length;


    if (
        byteLength > 500
    ) {

        translationResult.textContent =
            "Please enter a shorter sentence for translation.";

        setStatus(
            "The translation service accepts up to 500 bytes per request."
        );

        return;
    }


    const requestId =
        ++translationRequest;


    translationResult.innerHTML =
        `<span class="loading">
            Translating...
        </span>`;


    try {

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(
                `${detectedCode}|${target}`
            );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        /*
         * Ignore old API responses if
         * the user has already typed
         * something new.
         */

        if (
            requestId !==
            translationRequest
        ) {

            return;

        }


        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {

            throw new Error(
                "No translation returned."
            );

        }


        const translated =
            cleanApiText(
                data.responseData.translatedText
            );


        translationResult.textContent =
            translated;


        setStatus(
            "Analysis and translation completed."
        );


    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        translationResult.textContent =
            "Translation could not be loaded. Please check your internet connection and try again.";


        setStatus(
            "Translation service is temporarily unavailable."
        );

    }

}


/* =========================================================
   CLEAN API TEXT
   ========================================================= */

function cleanApiText(text) {

    return text
        .replace(
            /&quot;/g,
            '"'
        )
        .replace(
            /&#39;/g,
            "'"
        )
        .replace(
            /&amp;/g,
            "&"
        )
        .replace(
            /&lt;/g,
            "<"
        )
        .replace(
            /&gt;/g,
            ">"
        );

}


/* =========================================================
   CHARACTER COUNT
   ========================================================= */

function updateCharacterCount() {

    const length =
        [...sourceText.value].length;


    charCount.textContent =
        `${length} / 500`;

}


/* =========================================================
   RESET
   ========================================================= */

function resetResults() {

    detectedCode =
        "en";


    detectedLanguage.textContent =
        "Waiting for input...";


    translationResult.textContent =
        "Translation will appear here...";


    analysisLanguage.textContent =
        "-";


    wordCount.textContent =
        "0";


    analysisCharacters.textContent =
        "0";


    sentenceType.textContent =
        "-";


    sentenceStructure.textContent =
        "Enter a sentence to see its analysis.";


    keywords.innerHTML =
        `<span class="empty-keyword">
            No words yet
        </span>`;


    setStatus(
        "Ready"
    );


    updateCharacterCount();

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(message) {

    status.textContent =
        message;

}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(
    text,
    language
) {

    if (
        !window.speechSynthesis
    ) {

        setStatus(
            "Speech is not supported by your browser."
        );

        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        LANGUAGES[language]?.speech ||
        "en-IN";


    utterance.rate =
        0.9;


    speechSynthesis.cancel();


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

updateCharacterCount();

resetResults();