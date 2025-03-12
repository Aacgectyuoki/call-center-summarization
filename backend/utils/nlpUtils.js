const natural = require("natural");
const sentiment = require("sentiment");

// Tokenizer for text processing
const tokenizer = new natural.WordTokenizer();

/**
 * Cleans up text by removing unnecessary whitespace and punctuation.
 */
const cleanText = (text) => {
    return text.replace(/[^a-zA-Z0-9\s]/g, "").trim();
};

/**
 * Tokenizes text into words.
 */
const tokenizeText = (text) => {
    return tokenizer.tokenize(text);
};

/**
 * Analyzes sentiment (positive, neutral, negative).
 */
const analyzeSentiment = (text) => {
    const analysis = sentiment(text);
    if (analysis.score > 0) return "positive";
    if (analysis.score < 0) return "negative";
    return "neutral";
};

module.exports = {
    cleanText,
    tokenizeText,
    analyzeSentiment
};
