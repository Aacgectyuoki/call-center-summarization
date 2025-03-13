const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3();

const uploadFileToS3 = async (filePath, bucketName, key) => {
    const fileStream = fs.createReadStream(filePath);

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileStream,
    };

    return s3.upload(params).promise();
};

const getFileFromS3 = async (bucketName, key) => {
    const params = { Bucket: bucketName, Key: key };
    return s3.getObject(params).promise();
};

module.exports = { uploadFileToS3, getFileFromS3 };
