const { 
    PutLogEventsCommand, 
    CreateLogStreamCommand, 
    DescribeLogStreamsCommand 
} = require("@aws-sdk/client-cloudwatch-logs");

const { cloudWatchClient } = require("../config/awsConfig");
require("dotenv").config();

const LOG_GROUP_NAME = process.env.AWS_CLOUDWATCH_LOG_GROUP; // Define in `.env`
// const LOG_STREAM_NAME = `transcription-summary-${Date.now()}`; // Unique stream for each run
// let LOG_STREAM_NAME = null;

// Ensure Log Stream Exists & Get Sequence Token
const getLogStreamSequenceToken = async (logStreamName) => {
    try {
      const logStreams = await cloudWatchClient.send(
        new DescribeLogStreamsCommand({ logGroupName: LOG_GROUP_NAME })
      );
  
      const existingStream = logStreams.logStreams.find(stream => stream.logStreamName === logStreamName);
  
      if (!existingStream) {
        await cloudWatchClient.send(
          new CreateLogStreamCommand({ logGroupName: LOG_GROUP_NAME, logStreamName })
        );
        return null;
      }
  
      return existingStream.uploadSequenceToken || null;
    } catch (error) {
      console.error("❌ Error retrieving CloudWatch Log Stream:", error);
      return null;
    }
  };
  
  const logToCloudWatch = async (message, logStreamName) => {
    if (!logStreamName) {
      console.warn("⚠️ logStreamName is not set. Skipping log.");
      return;
    }
  
    try {
      const sequenceToken = await getLogStreamSequenceToken(logStreamName);
  
      const logEvent = {
        logGroupName: LOG_GROUP_NAME,
        logStreamName,
        logEvents: [{ message: JSON.stringify(message), timestamp: Date.now() }],
        sequenceToken: sequenceToken || undefined,
      };
  
      await cloudWatchClient.send(new PutLogEventsCommand(logEvent));
    } catch (error) {
      console.error("❌ CloudWatch Log Error:", error);
    }
  };

module.exports = { logToCloudWatch };
