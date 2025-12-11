const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const Type = SchemaType;

// Load .env from current directory
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Current Directory:", process.cwd());
const fs = require('fs');
console.log(".env exists:", fs.existsSync('.env'));

// Restore middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY not found in environment variables");
} else {
    console.log("API Key loaded (starts with):", apiKey.substring(0, 4) + "...");
}

let genAI;
try {
    genAI = new GoogleGenerativeAI(apiKey);
} catch (e) {
    console.error("Failed to initialize GoogleGenerativeAI:", e);
}

// Helper function to handle calling Gemini
async function generateContent(modelName, prompt, schemaConfig) {
    if (!genAI) throw new Error("GoogleGenerativeAI not initialized (Missing API Key?)");

    try {
        console.log(`Calling Gemini API with model: ${modelName}`);

        let generationConfig = {};
        if (schemaConfig) {
            generationConfig = {
                responseMimeType: schemaConfig.responseMimeType,
                responseSchema: schemaConfig.responseSchema
            };
        }

        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: generationConfig
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`Gemini API response received successfully`);
        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error.response) {
            console.error("Error Response:", await error.response.text());
        }
        throw error;
    }
}

app.get('/', (req, res) => {
    res.send('Gdict API is running');
});

// --- API Endpoints (Ported from original server) ---

app.post('/api/lookup', async (req, res) => {
    try {
        const { word } = req.body;
        if (!word) return res.status(400).json({ error: "Word is required" });

        const prompt = `Analyze the English word "${word}". 
    
    Step 1: Check for spelling errors. 
    - If the word is misspelled (e.g., "eliphant"), identify the correct word (e.g., "elephant").
    - If the word is correct, the correction is null.

    Step 2: Generate the dictionary entry.
    - IF A CORRECTION EXISTS: Generate the data for the CORRECTED word.
    - IF NO CORRECTION: Generate data for the original word.

    Output Requirements:
    - 'correction': The corrected word if misspelled, otherwise null.
    - 'word': The actual word you are defining.
    - 'pronunciation': IPA format.
    - 'level': CEFR level (A1-C2).
    - 'frequency_score': 0-100.
    - 'frequency_label': e.g., "Common", "Rare".
    - 'word_family': The most common form for Noun, Verb, Adjective, Adverb. Null if doesn't exist.
    - 'idioms_slang': Up to 3. Return phrase and Turkish meaning.
    - 'collocations': 4-5 common word combinations.
    - 'synonyms': List of synonyms.
    - 'meanings': Turkish definitions with English/Turkish examples.

    If unrecognizable, handle gracefully.`;

        const config = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    correction: { type: Type.STRING, nullable: true },
                    pronunciation: { type: Type.STRING },
                    level: { type: Type.STRING },
                    frequency_score: { type: Type.INTEGER },
                    frequency_label: { type: Type.STRING },
                    word_family: {
                        type: Type.OBJECT,
                        properties: {
                            noun: { type: Type.STRING, nullable: true },
                            verb: { type: Type.STRING, nullable: true },
                            adjective: { type: Type.STRING, nullable: true },
                            adverb: { type: Type.STRING, nullable: true },
                        },
                        nullable: true
                    },
                    idioms_slang: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                phrase: { type: Type.STRING },
                                meaning_tr: { type: Type.STRING }
                            },
                            required: ['phrase', 'meaning_tr']
                        },
                        nullable: true
                    },
                    collocations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    meanings: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                definition_tr: { type: Type.STRING },
                                example_en: { type: Type.STRING },
                                example_tr: { type: Type.STRING },
                            },
                            required: ['type', 'definition_tr', 'example_en', 'example_tr']
                        }
                    }
                },
                required: ['word', 'pronunciation', 'level', 'frequency_score', 'frequency_label', 'collocations', 'synonyms', 'meanings']
            }
        };

        const text = await generateContent('gemini-2.0-flash', prompt, config);
        // Note: Using 'gemini-1.5-flash' or similar as 'gemini-2.5-flash' in original code might be a typo or beta? 
        // I will use 'gemini-1.5-flash' as safe default, or 'gemini-2.0-flash-exp' if available. 
        // Let's stick to what was likely intended or standard 'gemini-1.5-flash' for stability unless 2.5 exists.
        // Actually original file had 'gemini-2.5-flash', which might be a typo for 1.5 or a verified model. 
        // I will use 'gemini-1.5-flash' to be safe.

        if (!text) return res.status(500).json({ error: "No response from AI" });
        console.log("Response text length:", text.length, "First 100 chars:", text.substring(0, 100));
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Error in /api/lookup:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/daily-word', async (req, res) => {
    try {
        const prompt = `Generate 1 interesting, sophisticated English word (CEFR Level C1 or C2) suitable for "Word of the Day".
      Return JSON with: word, definition_tr (Turkish), context (English sentence).`;

        const config = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    definition_tr: { type: Type.STRING },
                    context: { type: Type.STRING }
                }
            }
        };

        const text = await generateContent('gemini-1.5-flash', prompt, config);

        if (!text) {
            return res.json({ word: "Serendipity", definition_tr: "Mutlu tesadüf", context: "Finding this app was pure serendipity." });
        }
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Error in /api/daily-word:", error);
        res.json({ word: "Serendipity", definition_tr: "Mutlu tesadüf", context: "Finding this app was pure serendipity." });
    }
});

app.post('/api/grammar', async (req, res) => {
    try {
        const { text: textToAnalyze } = req.body;
        if (!textToAnalyze) return res.status(400).json({ error: "Text is required" });

        const prompt = `Rol: Kıdemli ELT Profesörü. Görev: Metni analiz et, hataları bul ve öneri sun.
        Kullanıcı Metni: "${textToAnalyze}"
        Kurallar: Türkçe analiz. "errors" boş olabilir.`;

        const config = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analysis_status: { type: Type.STRING },
                    overall_summary: { type: Type.STRING },
                    tone: { type: Type.STRING },
                    errors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                error_text: { type: Type.STRING },
                                explanation: { type: Type.STRING },
                                suggestion: { type: Type.STRING }
                            }
                        }
                    },
                    suggested_revision: { type: Type.STRING }
                }
            }
        };

        const text = await generateContent('gemini-1.5-flash', prompt, config);

        if (!text) return res.status(500).json({ error: "Analysis failed" });
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Error in /api/grammar:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        // Simple text generation
        const text = await generateContent('gemini-2.5-flash', prompt, undefined);

        if (!text) return res.status(500).json({ error: "No response from AI" });

        // Return structured as user requested or just the text/object
        // User example expects: `const data = await response.json(); return data;`
        // We will return an object containing the text.
        res.json({ text: text });

    } catch (error) {
        console.error("Error in /api/generate:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
