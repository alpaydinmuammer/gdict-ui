const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI, Type } = require("@google/genai");

const app = express();

// Try loading from multiple possible locations
const envPathLocal = path.resolve(__dirname, '../.env.local');
const envPathRoot = path.resolve(__dirname, '../.env');
const envPathServer = path.resolve(__dirname, '.env');

console.log(`Attempting to load .env from: ${envPathLocal}`);
dotenv.config({ path: envPathLocal });

if (!process.env.API_KEY) {
    console.log(`Attempting to load .env from: ${envPathRoot}`);
    dotenv.config({ path: envPathRoot });
}

if (!process.env.API_KEY) {
    console.log(`Attempting to load .env from: ${envPathServer}`);
    dotenv.config({ path: envPathServer });
}
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.API_KEY;

// Check if API key is present
if (!apiKey) {
    console.error("API_KEY not found in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

console.log(`API Key loaded: ${apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No'}`);

// Helper function to handle calling Gemini (similar to frontend logic)
async function generateContent(model, contents, config) {
    try {
        console.log(`Calling Gemini API with model: ${model}`);
        const response = await ai.models.generateContent({
            model,
            contents,
            config
        });
        console.log(`Gemini API response received successfully`);
        return response.text;
    } catch (error) {
        console.error("Gemini API Error Details:");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        if (error.cause) {
            console.error("Error cause:", error.cause);
        }
        throw error;
    }
}

app.post('/api/lookup', async (req, res) => {
    try {
        const { word } = req.body;
        if (!word) {
            return res.status(400).json({ error: "Word is required" });
        }

        const prompt = `Analyze the English word "${word}". 
    
    Step 1: Check for spelling errors. 
    - If the word is misspelled (e.g., "eliphant"), identify the correct word (e.g., "elephant").
    - If the word is correct, the correction is null.

    Step 2: Generate the dictionary entry.
    - IF A CORRECTION EXISTS: Generate the data for the CORRECTED word (not the misspelled one).
    - IF NO CORRECTION: Generate data for the original word.

    Output Requirements:
    - 'correction': The corrected word if misspelled, otherwise null.
    - 'word': The actual word you are defining (the corrected one if applicable).
    - 'pronunciation': IPA format.
    - 'level': CEFR level (A1-C2).
    - 'frequency_score': 0-100.
    - 'frequency_label': e.g., "Common", "Rare".
    - 'word_family': The morphological variations based on the root (Noun, Verb, Adjective, Adverb). Pick the most common form for each. Return null if a form doesn't exist.
    - 'idioms_slang': Identify up to 3 common idioms, phrasal verbs, or slang usages where this word is a key component. Return the phrase and its Turkish meaning. Return empty array if none.
    - 'collocations': 4-5 common word combinations.
    - 'synonyms': List of synonyms.
    - 'meanings': Turkish definitions with English/Turkish examples.

    If the word is completely unrecognizable/gibberish and no reasonable correction exists, return empty arrays for lists and a generic message or handle gracefully, but try to find a correction if possible.`;

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
                            required: ["phrase", "meaning_tr"]
                        },
                        nullable: true
                    },
                    collocations: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    synonyms: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
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
                            required: ["type", "definition_tr", "example_en", "example_tr"]
                        }
                    }
                },
                required: ["word", "pronunciation", "level", "frequency_score", "frequency_label", "collocations", "synonyms", "meanings"]
            }
        };

        const text = await generateContent('gemini-2.5-flash', prompt, config);

        if (!text) {
            return res.status(500).json({ error: "No response from AI" });
        }
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Error in /api/lookup:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/daily-word', async (req, res) => {
    try {
        const prompt = `Generate 1 interesting, sophisticated English word (CEFR Level C1 or C2) suitable for "Word of the Day".
      
      It should be a word that is useful in academic or professional contexts but might not be known by everyone.
      
      Return JSON with:
      - word: The word itself.
      - definition_tr: A short, punchy Turkish definition (max 10 words).
      - context: A very short English sentence showing usage.`;

        const config = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    definition_tr: { type: Type.STRING },
                    context: { type: Type.STRING }
                },
                required: ["word", "definition_tr", "context"]
            }
        };

        const text = await generateContent('gemini-2.5-flash', prompt, config);

        if (!text) {
            // Fallback word if AI fails
            return res.json({ word: "Serendipity", definition_tr: "Mutlu tesadüf", context: "Finding this app was pure serendipity." });
        }
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Error in /api/daily-word:", error);
        // Fallback on error
        res.json({ word: "Serendipity", definition_tr: "Mutlu tesadüf", context: "Finding this app was pure serendipity." });
    }
});

app.post('/api/grammar', async (req, res) => {
    try {
        const { text: textToAnalyze } = req.body;
        if (!textToAnalyze) {
            return res.status(400).json({ error: "Text is required" });
        }

        const prompt = `Rol: Sen kıdemli bir ELT (English Language Teaching) Profesörüsün ve akademik düzeyde bir editörsün. Analizlerin detaylı, açıklayıcı ve pedagojik olmalı.

    Görev: Kullanıcının girdiği metni analiz et, hataları bul ve daha iyi bir versiyon öner.
    
    Kullanıcı Metni:
    "${textToAnalyze}"

    Kurallar:
    1. Analiz sonuçlarını, kullanıcının kolayca anlayabileceği bir Türkçe ile yaz.
    2. Hata bulunamazsa "errors" dizisi boş olmalıdır.
    3. Olabildiğince çok hata türünü tespit et ve "type" alanını kullan.
    `;

        const config = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analysis_status: { type: Type.STRING, description: "Durum (Örn: Mükemmel / Minor Hata / Kritik Hata)" },
                    overall_summary: { type: Type.STRING, description: "Metnin genel akıcılığı, grameri ve tonu hakkında kısa, yapıcı bir özet." },
                    tone: { type: Type.STRING, description: "Metnin Tonu (Örn: Formal / Informal / Akademik / Conversational)" },
                    errors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "Hata Tipi (Örn: Grammar / Tense / Spelling / Punctuation)" },
                                error_text: { type: Type.STRING, description: "Hata içeren kelime veya kelime grubu" },
                                explanation: { type: Type.STRING, description: "Hatanın dilbilgisel açıklaması ve kuralı" },
                                suggestion: { type: Type.STRING, description: "Doğru kullanım şekli" }
                            },
                            required: ["type", "error_text", "explanation", "suggestion"]
                        }
                    },
                    suggested_revision: { type: Type.STRING, description: "Tüm hatalar giderildikten sonra metnin tamamının düzeltilmiş, en akıcı hali." }
                },
                required: ["analysis_status", "overall_summary", "tone", "errors", "suggested_revision"]
            }
        };

        const text = await generateContent('gemini-2.5-flash', prompt, config);

        if (!text) {
            return res.status(500).json({ error: "Analysis failed" });
        }
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Error in /api/grammar:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
