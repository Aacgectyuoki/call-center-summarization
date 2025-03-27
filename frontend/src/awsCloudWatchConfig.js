export const AWS_CLOUDWATCH_CONFIG = {
    region: "us-east-1", // or your region
    credentials: {
      accessKeyId: "YOUR_AWS_ACCESS_KEY",
      secretAccessKey: "YOUR_AWS_SECRET_KEY",
    },
    logGroupName: "YOUR_LOG_GROUP",
    // If each job writes to a unique log stream, you’ll need the stream name
    // or logic to find it. For example:
    logStreamName: `transcription-summary-${Date.now()}`,
  };
  