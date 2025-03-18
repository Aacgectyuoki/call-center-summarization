const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { ChatOpenAI } = require("@langchain/openai");
const { LLMChain } = require("langchain/chains");
const { PromptTemplate } = require("@langchain/core/prompts");

const { Readable } = require("stream");

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env.S3_BUCKET_NAME;

/**
 * Convert S3 file stream to a string.
 */
const streamToString = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
};

/**
 * Fetch transcription from S3.
 */
const fetchS3File = async (bucket, key) => {
    try {
        console.log("Fetching S3 file with Key:", key); // ✅ Debugging key before fetching

        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3Client.send(command);
        const data = await streamToString(response.Body);
        const jsonData = JSON.parse(data);

        // Ensure correct data structure
        if (!jsonData.results || !jsonData.results.transcripts || !jsonData.results.transcripts.length) {
            throw new Error("Invalid transcription format");
        }

        return jsonData.results.transcripts.map(t => t.transcript).join(" ");
    } catch (error) {
        console.error("❌ S3 Fetch Error:", error);
        throw new Error("Failed to fetch transcription data");
    }
};


/**
 * Generate Summary using LangChain.
 */
const generateSummary = async (req, res) => {
    try {
        const { jobName, length = "regular", complexity = "regular", format = "regular" } = req.body;

        if (!jobName) {
            return res.status(400).json({ message: "jobName is required" });
        }

        // ✅ Use jobName to fetch the file from S3
        const key = `${jobName}.json`;
        console.log("Generated S3 Key:", key); // Debug log before calling fetchS3File

        const transcription = await fetchS3File(bucket, key);

        if (!transcription || !transcription.trim()) {
            return res.status(400).json({ message: "Empty or invalid transcription data" });
        }

        const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
            transcript: transcription,
        });

        res.json({ summary });

    } catch (error) {
        console.error("❌ Summarization Error:", error);
        res.status(500).json({ error: "Failed to summarize transcription" });
    }
};

module.exports = { generateSummary };