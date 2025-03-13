const axios = require('axios');

const openAiApiKey = process.env.OPENAI_API_KEY;

const summarizeText = async (text) => {
    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions", 
        {
            model: "gpt-4",
            messages: [{ role: "system", content: "Summarize this text." }, { role: "user", content: text }],
            max_tokens: 150,
        }, 
        { headers: { Authorization: `Bearer ${openAiApiKey}`, "Content-Type": "application/json" } 
    });

    return response.data.choices[0].message.content;
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



