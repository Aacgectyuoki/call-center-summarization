const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const z = require("zod");

/**
 * ✅ Initialize OpenAI Model with Faster Execution
 */
const model = new ChatOpenAI({
    modelName: "gpt-4-turbo",
    temperature: 0.3, // Keeps responses structured & clear
    openAIApiKey: process.env.OPENAI_API_KEY
});

/**
 * ✅ Define AI Prompts for Bullet-Point Summaries
 */
const summaryPrompt = new PromptTemplate({
    inputVariables: ["transcript"],
    template: `
    Summarize the following transcript in a **structured bullet-point format**:
    - Use **bolded main points** for key topics.
    - Use **sub-bullets (◦)** for supporting details.
    - Extract **technical terms** and define them simply.

    **Output Format**:
    1. **Bullet-Point Summary**
    2. **Technical Terms and Their Definitions**
    
    Transcript:
    {transcript}
    `
});

/**
 * 🟢 Optimized AI Summarization Function
 */
async function generateStructuredSummary(transcript) {
    try {
        console.log("📡 Processing transcript with OpenAI...");

        if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
            throw new Error("Invalid transcript input");
        }

        console.log("🔹 Generating Structured Bullet-Point Summary...");
        
        const formattedSummaryPrompt = await summaryPrompt.format({ transcript });
        const response = await model.invoke([{ role: "user", content: formattedSummaryPrompt }]);

        // Ensure the response contains text
        if (!response || !response.content) {
            console.error("❌ OpenAI API did not return valid content:", response);
            throw new Error("Invalid OpenAI response");
        }

        const summaryText = response.content;

        return { summary: summaryText };
        // console.log("📡 AI Model Raw Response:", summary);

        // if (!summary || typeof summary !== "string") {
        //     console.error("❌ AI model returned invalid response:", summary);
        //     throw new Error("AI model response is invalid");
        // }

        // return summary;
    } catch (error) {
        console.error("❌ AI Summarization Error:", error.message);
        throw new Error("Failed to generate structured summary");
    }
}

module.exports = { generateStructuredSummary };
