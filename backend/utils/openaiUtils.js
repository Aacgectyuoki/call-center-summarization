const axios = require("axios");

const summarizeText = async (text, length = "regular", complexity = "regular", format = "regular") => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in .env

    // 🔹 1️⃣ Define rules for different summary lengths
    let lengthInstruction = "";
    if (length === "concise") {
        lengthInstruction = "Keep the summary brief while ensuring completeness.";
    } else if (length === "super concise") {
        lengthInstruction = "Extract only the core insights in the shortest possible way.";
    } else {
        lengthInstruction = "Provide a well-balanced summary that retains key details without unnecessary length.";
    }

    // 🔹 2️⃣ Define rules for different complexity levels
    let complexityInstruction = "";
    if (complexity === "simplified") {
        complexityInstruction = "Use simple and easy-to-understand language.";
    } else if (complexity === "super simplified") {
        complexityInstruction = "Use extremely basic words while retaining meaning.";
    } else {
        complexityInstruction = "Use clear, professional, and well-structured language.";
    }

    // 🔹 3️⃣ Define rules for different formats
    let formatInstruction = "";
    if (format === "bullet-pointed") {
        formatInstruction = "Structure the summary using bullet points for clarity.";
    } else if (format === "keywords") {
        formatInstruction = "Provide a summary using only essential keywords.";
    } else {
        formatInstruction = "Use a structured paragraph format with logical flow.";
    }

    // 🔹 4️⃣ Construct the **Final GPT-4 Prompt**
    let prompt = `
You are an expert summarizer. Your task is to summarize the provided transcript while ensuring clarity, accuracy, and logical flow. 

### **Guidelines:**
1️⃣ **Preserve Key Takeaways**: Ensure all main points are retained accurately.
2️⃣ **Maintain Coherence**: The summary should be logically structured and easy to read.
3️⃣ **Adapt Based on User Preferences**:
   - **Length:** ${lengthInstruction}
   - **Complexity:** ${complexityInstruction}
   - **Format:** ${formatInstruction}
4️⃣ **Why It Matters**: The summary should reflect not just *what is said*, but also *why it matters* to the audience.

Ensure that the output aligns with these guidelines and delivers a high-quality, contextually appropriate summary.
    `;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: text }
                ],
                max_tokens: 350, // Increased slightly for more detailed summaries
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI API error:", error);
        throw new Error("Failed to summarize text");
    }
};

module.exports = { summarizeText };
