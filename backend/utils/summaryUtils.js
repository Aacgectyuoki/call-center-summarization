const Sentiment = require("sentiment");
require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const sentiment = new Sentiment();

/**
 * Summarizes a given transcription and performs sentiment analysis.
 * @param {string} transcription - The text transcription of a call.
 * @returns {Promise<Object>} - Returns an object containing the summary and sentiment analysis.
 */
async function summarizeText(transcription) {
    try {
        // Generate summary using OpenAI GPT
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an expert at summarizing call center transcriptions accurately while preserving key details." },
                { role: "user", content: `Summarize this call transcription:\n${transcription}` }
            ],
            temperature: 0.5,
            max_tokens: 200
        });

        // ✅ Ensure response and choices exist before accessing them
        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error("Invalid API response. No choices returned.");
        }

        // ✅ Ensure message is not null or undefined
        const message = response.choices[0].message?.content;
        if (!message) {
            throw new Error("OpenAI response message is empty or null.");
        }

        // Extract summary from API response
        const summary = message.trim();

        // Perform sentiment analysis
        const sentimentResult = sentiment.analyze(summary);
        let sentimentScore = "Neutral";
        if (sentimentResult.score > 1) sentimentScore = "Positive";
        if (sentimentResult.score < -1) sentimentScore = "Negative";

        return { summary, sentiment: sentimentScore };
    } catch (error) {
        console.error("Error in summarization:", error);
        throw new Error("Failed to generate summary.");
    }
}

module.exports = { summarizeText };
