const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Checking API Key permissions...");

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No 'models' property in response:", JSON.stringify(data));
        }
    })
    .catch(err => console.error("Error:", err));
