const AWS = require("aws-sdk");
const { saveTranscription } = require("./awsTranscribeUtils");

AWS.config.update({ region: 'us-east-1' });

async function startRealTimeTranscription(audioStream) {
    const transcribeService = new AWS.TranscribeService();
    const connection = new WebSocket("wss://transcribestreaming.us-east-1.amazonaws.com");

    connection.onopen = () => {
        console.log("Connected to AWS Transcribe WebSocket.");
        connection.send(audioStream);
    };

    connection.onmessage = (message) => {
        const transcriptData = JSON.parse(message.data);
        if (transcriptData && transcriptData.results) {
            const transcriptText = transcriptData.results.transcripts.map(t => t.transcript).join(" ");
            saveTranscription(transcriptText);
        }
    };

    connection.onerror = (error) => console.error("WebSocket Error:", error);
}

module.exports = { startRealTimeTranscription };