const AWS = require("aws-sdk");

// Configure AWS Comprehend
const comprehend = new AWS.Comprehend({
  region: process.env.AWS_REGION,
});

/**
 * Analyze sentiment of given text
 */
exports.analyzeSentiment = async (text) => {
  try {
    const params = {
      LanguageCode: "en",
      Text: text,
    };

    const result = await comprehend.detectSentiment(params).promise();
    return result.Sentiment; // Example: "POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"
  } catch (error) {
    console.error("Comprehend Error:", error);
    throw error;
  }
};

/**
 * Detect key entities in text
 */
exports.detectEntities = async (text) => {
  try {
    const params = {
      LanguageCode: "en",
      Text: text,
    };

    const result = await comprehend.detectEntities(params).promise();
    return result.Entities; // List of entities detected in text
  } catch (error) {
    console.error("Comprehend Error:", error);
    throw error;
  }
};
