// exports.generateSummary = async (text) => {
//     // Simulate AI summarization
//     return {
//         summary: "This is a summary of: " + text,
//         sentiment: "Neutral",
//         keywords: ["sample", "summary"]
//     };
// };

const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Summarizes the given text using OpenAI's GPT API.
 * @param {string} text - The transcription text.
 * @returns {Promise<string>} - The summarized text.
 */
async function summarizeText(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful AI assistant that summarizes call transcriptions concisely." },
                { role: "user", content: `Summarize the following call transcript:\n\n${text}` }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error in summarization:", error);
        throw new Error("Summarization failed");
    }
}

module.exports = { summarizeText };
