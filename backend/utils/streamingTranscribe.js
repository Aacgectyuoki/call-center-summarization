const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");
const mic = require("mic");

const transcribeStreamClient = new TranscribeStreamingClient({ region: "us-east-1" });

const startStreamingTranscription = async () => {
    const micInstance = mic({
        rate: "16000",
        channels: "1",
        encoding: "pcm",
    });

    const micInputStream = micInstance.getAudioStream();
    micInstance.start();

    const command = new StartStreamTranscriptionCommand({
        LanguageCode: "en-US",
        MediaSampleRateHertz: 16000,
        MediaEncoding: "pcm",
        AudioStream: micInputStream,
    });

    try {
        const audioStream = await transcribeStreamClient.send(command);

        micInputStream.pipe(audioStream); // ✅ Correct way to send audio

        audioStream[Symbol.asyncIterator]().next().then(({ value }) => {
            console.log("Live Transcription:", value.Transcript.Results);
        });

    } catch (error) {
        console.error("Streaming transcription failed:", error);
    }
};

module.exports = { startStreamingTranscription };

