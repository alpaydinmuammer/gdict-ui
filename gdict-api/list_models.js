const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error("API Key not found!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching available models...\n");

        const models = await genAI.listModels();

        console.log("Available Models:");
        console.log("=================\n");

        for await (const model of models) {
            console.log(`Name: ${model.name}`);
            console.log(`Display Name: ${model.displayName}`);
            console.log(`Description: ${model.description}`);
            console.log(`Supported Generation Methods: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log("---");
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
