const axios = require('axios');

const summarizeText = async (text) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Store in .env file

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4", // Ensure you're using GPT-4
                messages: [
                    { role: "system", content: "Summarize the given text." },
                    { role: "user", content: text },
                ],
                max_tokens: 150,
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

// const axios = require('axios');

// const summarizeText = async (text) => {
//     try {
//         const response = await axios.post(
//             'https://api.openai.com/v1/chat/completions',
//             {
//                 model: 'gpt-4',
//                 messages: [{ role: 'user', content: `Summarize this: ${text}` }],
//                 max_tokens: 200
//             },
//             {
//                 headers: {
//                     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('Error with OpenAI API:', error);
//         throw new Error('Summarization failed.');
//     }
// };

// module.exports = { summarizeText };



