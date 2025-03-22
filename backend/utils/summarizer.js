const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StructuredTool } = require("@langchain/core/tools");
const z = require("zod");


/**
 * ✅ Initialize OpenAI Model
 */
const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY
});

/**
 * ✅ Define Prompts for Summarization
 */
const summaryPrompt = new PromptTemplate({
    inputVariables: ["transcript"],
    template: "Summarize the following transcript in clear and concise bullet points:\n\n{transcript}"
});

const bulletPrompt = new PromptTemplate({
    inputVariables: ["summary"],
    template: "Summarize the following transcript in clear and concise bullet points, keeping only key concepts and avoiding unnecessary engagement:\n\n{transcript}"
});

const humanizePrompt = new PromptTemplate({
    inputVariables: ["structuredSummary"],
    template: "Rewrite this structured summary to be professional, clear, and easy to read without unnecessary engagement:\n\n{structuredSummary}"
});

/**
 * ✅ AI Processing Tools
 */
class BulletStructuringTool extends StructuredTool {
    name = "Bullet Structuring";
    description = "Formats a summary into structured bullet points.";
    schema = z.object({ summary: z.string() });

    async _call({ summary }) {
        const formattedSummary = await bulletPrompt.format({ summary }); // Await the formatted summary
        return await model.invoke([{ role: "user", content: formattedSummary }]); // Proper format
    }
}

class HumanizerTool extends StructuredTool {
    name = "Humanizer";
    description = "Rewrites the summary in a more natural and engaging way.";
    schema = z.object({ structuredSummary: z.string() });

    async _call({ structuredSummary }) {
        const formattedSummary = await humanizePrompt.format({ structuredSummary }); // Await the formatted summary
        return await model.invoke([{ role: "user", content: formattedSummary }]); // Proper format
    }
}

/**
 * 🟢 Main Summarization Function
 */
async function generateStructuredSummary(transcript) {
    try {
        console.log("📡 Received transcript for summarization...");

        if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
            throw new Error("Invalid transcript input");
        }

        console.log("🔹 Step 1: Generating Initial Summary...");
        const formattedSummaryPrompt = await summaryPrompt.format({ transcript }); // Await the formatted summary prompt
        const summary = await model.invoke([{ role: "user", content: formattedSummaryPrompt }]);

        console.log("🔹 Step 2: Structuring Bullet Points...");
        const formattedBulletPrompt = await bulletPrompt.format({ summary }); // Await the formatted bullet prompt
        const structuredSummary = await model.invoke([{ role: "user", content: formattedBulletPrompt }]);

        console.log("🔹 Step 3: Making it More Engaging...");
        const formattedHumanizePrompt = await humanizePrompt.format({ structuredSummary }); // Await the formatted humanize prompt
        const finalSummary = await model.invoke([{ role: "user", content: formattedHumanizePrompt }]);

        return finalSummary;
    } catch (error) {
        console.error("❌ AI Summarization Error:", error);
        throw new Error("Failed to generate structured summary");
    }
}

module.exports = { generateStructuredSummary };
