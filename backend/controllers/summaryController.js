const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { PromptTemplate } = require("langchain/prompts");
const { LLMChain } = require("langchain/chains");
const { pipeline } = require("stream/promises");
const { StringDecoder } = require("string_decoder");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Convert S3 file stream to string
const streamToString = async (stream) => {
    const decoder = new StringDecoder("utf8");
    let data = "";

    for await (const chunk of stream) {
        data += decoder.write(chunk);
    }
    data += decoder.end();
    return data;
};

// Fetch transcription from S3
const fetchS3File = async (bucket, key) => {
    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3Client.send(command);
        const data = await streamToString(response.Body);
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ S3 Fetch Error:", error);
        throw new Error("Failed to fetch transcription data");
    }
};

// Generate Summary using LangChain
const generateSummary = async (req, res) => {
    try {
        const { jobName, length = "regular", complexity = "regular", format = "regular" } = req.body;
        if (!jobName) {
            return res.status(400).json({ error: "Missing jobName parameter" });
        }

        // Fetch transcription from S3
        const transcriptionData = await fetchS3File(process.env.S3_BUCKET_NAME, `${jobName}.json`);

        // Extract transcript text
        if (!transcriptionData.results?.transcripts?.length) {
            return res.status(400).json({ error: "Invalid transcription format" });
        }
        const fullText = transcriptionData.results.transcripts.map(t => t.transcript).join(" ");

        if (!fullText.trim()) {
            return res.status(400).json({ error: "Empty transcript detected" });
        }

        // Call AI summarization function with user preferences
        const model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.5,
            maxTokens: 1000, // 🔥 Increased token limit for detailed summaries
        });

        const prompt = new PromptTemplate({
            template: `Summarize the following transcript based on the given preferences:
            - Length: {length}
            - Complexity: {complexity}
            - Format: {format}

            Transcript:
            {transcript}

            Summary:`,
            inputVariables: ["length", "complexity", "format", "transcript"],
        });

        const chain = new LLMChain({ llm: model, prompt });

        const summary = await chain.call({
            length,
            complexity,
            format,
            transcript: fullText,
        });

        res.json({ summary });

    } catch (error) {
        console.error("❌ Summarization Error:", error);
        res.status(500).json({ error: "Failed to summarize transcription" });
    }
};

module.exports = { generateSummary };
