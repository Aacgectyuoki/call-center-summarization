const { 
    PutLogEventsCommand, 
    CreateLogStreamCommand, 
    DescribeLogStreamsCommand 
} = require("@aws-sdk/client-cloudwatch-logs");

const { cloudWatchClient } = require("../config/awsConfig");
require("dotenv").config();

const LOG_GROUP_NAME = process.env.AWS_CLOUDWATCH_LOG_GROUP; // Define in `.env`
const LOG_STREAM_NAME = `transcription-summary-${Date.now()}`; // Unique stream for each run

// Ensure Log Stream Exists & Get Sequence Token
const getLogStreamSequenceToken = async () => {
    try {
        const logStreams = await cloudWatchClient.send(
            new DescribeLogStreamsCommand({ logGroupName: LOG_GROUP_NAME })
        );

        const existingStream = logStreams.logStreams.find(stream => stream.logStreamName === LOG_STREAM_NAME);

        if (!existingStream) {
            await cloudWatchClient.send(
                new CreateLogStreamCommand({ logGroupName: LOG_GROUP_NAME, logStreamName: LOG_STREAM_NAME })
            );
            return null;
        }

        return existingStream.uploadSequenceToken || null;
    } catch (error) {
        console.error("❌ Error retrieving CloudWatch Log Stream:", error);
        return null;
    }
};

// Log Events to CloudWatch
const logToCloudWatch = async (message) => {
    try {
        const sequenceToken = await getLogStreamSequenceToken();

        const logEvent = {
            logGroupName: LOG_GROUP_NAME,
            logStreamName: LOG_STREAM_NAME,
            logEvents: [{ message: JSON.stringify(message), timestamp: Date.now() }],
            sequenceToken: sequenceToken || undefined, // Use token for ordering if available
        };

        await cloudWatchClient.send(new PutLogEventsCommand(logEvent));
    } catch (error) {
        console.error("❌ CloudWatch Log Error:", error);
    }
};

module.exports = { logToCloudWatch };
