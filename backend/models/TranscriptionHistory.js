const { getDB } = require("../config/db");

const getTranscriptionHistoryCollection = () => {
    const db = getDB();
    return db.collection("transcriptionhistories");
};

module.exports = { getTranscriptionHistoryCollection };
