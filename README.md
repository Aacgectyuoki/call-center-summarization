# DTSummarizr - AI Transcription & Summarization System

A robust AI-powered call center transcription and summarization system that transcribes audio/video calls, processes the text, and generates summaries using AWS services and NLP models.

## Features

✅ **Audio & Video Transcription** → AWS Transcribe & OpenAI Whisper convert speech into text.  
✅ **AI Summarization** → AWS SageMaker & OpenAI GPT generate concise summaries.  
✅ **Sentiment Analysis** → AWS Comprehend detects tone & emotions in conversations.  
✅ **YouTube Integration** → Transcribe & summarize YouTube videos.  
✅ **Scalable File Storage** → Upload, store, & process files using AWS S3.  
✅ **Serverless Processing** → AWS Lambda auto-triggers transcription & summarization.  
✅ **Secure API Access** → Authenticate users with JWT.  

---

## Tech Stack

| **Component**           | **Technology Used**                                      |
|------------------------|----------------------------------------------------------|
| **Backend**            | Node.js, Express.js                                      |
| **Frontend**           | React (Planned)                                          |
| **Database**           | MongoDB (Native Driver, NOT Mongoose)                    |
| **File Storage**       | AWS S3                                                   |
| **Speech-to-Text**     | AWS Transcribe, OpenAI Whisper                           |
| **Summarization**      | AWS SageMaker, OpenAI GPT                                |
| **NLP Processing**     | AWS Comprehend, spaCy, NLTK                              |
| **Authentication**     | JWT, bcrypt                                              |
| **Deployment**         | AWS EC2, PM2, Nginx, MongoDB Atlas                       |
| **API Testing**        | Postman                                                  |

---

## Project Structure

📦 call-center-ai
 ┣ 📂 backend
 ┃ ┣ 📂 config
 ┃ ┃ ┣ 📜 db.js                # MongoDB connection
 ┃ ┃ ┣ 📜 awsConfig.js         # AWS SDK configuration
 ┃ ┃ ┗ 📜 envConfig.js         # Environment variable handler
 ┃ ┣ 📂 controllers
 ┃ ┃ ┣ 📜 authController.js    # Handles authentication (JWT)
 ┃ ┃ ┣ 📜 callController.js    # Manages call records
 ┃ ┃ ┣ 📜 summaryController.js # Handles summarization logic (AWS SageMaker)
 ┃ ┃ ┣ 📜 transcriptionController.js  # Handles transcriptions (AWS Transcribe)
 ┃ ┃ ┣ 📜 youtubeController.js # Handles YouTube transcription
 ┃ ┃ ┣ 📜 videoController.js    # Handles video uploads & processing
 ┃ ┃ ┗ 📜 analyticsController.js # Sentiment & processing time tracking
 ┃ ┣ 📂 middleware
 ┃ ┃ ┣ 📜 authMiddleware.js     # JWT authentication
 ┃ ┃ ┣ 📜 errorHandler.js       # Handles errors globally
 ┃ ┃ ┗ 📜 timerMiddleware.js    # Logs processing time for API requests
 ┃ ┣ 📂 models
 ┃ ┃ ┣ 📜 Call.js              # Call schema (audio file metadata)
 ┃ ┃ ┣ 📜 File.js              # File metadata schema
 ┃ ┃ ┣ 📜 Settings.js          # User settings schema
 ┃ ┃ ┣ 📜 Summary.js           # Summarization schema
 ┃ ┃ ┣ 📜 Transcription.js     # Transcription schema
 ┃ ┃ ┣ 📜 User.js              # User schema
 ┃ ┃ ┗ 📜 Video.js             # Video metadata schema
 ┃ ┣ 📂 routes
 ┃ ┃ ┣ 📜 calls.js             # Routes for handling calls
 ┃ ┃ ┣ 📜 summaries.js         # Routes for summaries (AWS SageMaker)
 ┃ ┃ ┣ 📜 transcriptions.js     # Routes for transcriptions (AWS Transcribe)
 ┃ ┃ ┣ 📜 youtube.js           # Routes for YouTube transcription
 ┃ ┃ ┣ 📜 awsTranscribe.js     # Routes for AWS Transcribe
 ┃ ┃ ┣ 📜 awsS3.js             # Routes for AWS S3 uploads/downloads
 ┃ ┃ ┣ 📜 awsLambda.js         # Routes for AWS Lambda-triggered processing
 ┃ ┃ ┗ 📜 video.js             # Routes for video-to-audio conversion & uploads
 ┃ ┣ 📂 utils
 ┃ ┃ ┣ 📜 fileHandler.js        # Handles file uploads (AWS S3)
 ┃ ┃ ┣ 📜 awsS3Utils.js        # Handles AWS S3 storage/retrieval
 ┃ ┃ ┣ 📜 awsTranscribeUtils.js # Calls AWS Transcribe for speech-to-text
 ┃ ┃ ┣ 📜 awsSageMakerUtils.js  # Calls AWS SageMaker for text summarization
 ┃ ┃ ┣ 📜 summaryUtils.js       # Summarization helper functions
 ┃ ┃ ┣ 📜 transcribeUtils.js    # Transcription functions (AWS & local)
 ┃ ┃ ┣ 📜 nlpUtils.js           # NLP-based text processing
 ┃ ┃ ┣ 📜 youtubeUtils.js       # Extracts audio from YouTube videos
 ┃ ┃ ┗ 📜 videoUtils.js         # Converts video files to audio (AWS Lambda)
 ┃ ┣ 📂 aws_lambda
 ┃ ┃ ┣ 📜 videoProcessor.js    # AWS Lambda function for video processing
 ┃ ┃ ┣ 📜 audioExtractor.js    # AWS Lambda function for audio extraction
 ┃ ┃ ┣ 📜 transcribeTrigger.js # AWS Lambda function for auto-transcription
 ┃ ┃ ┗ 📜 s3EventHandler.js    # AWS Lambda function for S3 event processing
 ┃ ┣ 📜 server.js              # Main Express server file (JS API)
 ┃ ┣ 📜 .env                   # Environment variables (AWS keys, DB credentials)
 ┃ ┣ 📜 package.json           # Backend dependencies
 ┗ 📜 README.md                # Documentation

---

## 🔧 Setup & Installation

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/Aacgectyuoki/call-center-summarization.git
cd call-center-summarization
```

### **2️⃣ Install Backend Dependencies**
```sh
cd backend
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a .env file in the backend folder:

```sh
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
```

### **4️⃣ Run the Backend Server Locally**
```sh
cd backend
node server.js
```

---

## Deployment on AWS EC2

### **1️⃣ Launch an AWS EC2 Instance**
Use Ubuntu 20.04 or newer.
Enable ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Backend API) in Security Groups.

### **2️⃣ Install Dependencies on EC2**
```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git
```

### **3️⃣ Clone the Repository & Install Dependencies**
```sh
git clone https://github.com/Aacgectyuoki/call-center-summarization.git
cd call-center-summarization/backend
npm install
```

### **4️⃣ Run the Server with PM2 (Keeps API Running in Background)**
```sh
npm install -g pm2
pm2 start server.js --name dtsummarizr-api
pm2 save
pm2 startup
```

### **5️⃣ Set Up Nginx for Reverse Proxy (Optional, for Production)**
```sh
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/dtsummarizr
```

Paste this inside the file:
```sh
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Save and exit, then restart Nginx:
```sh
sudo ln -s /etc/nginx/sites-available/dtsummarizr /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## API Endpoints

| **Method** | **Endpoint**             | **Description**                      |
|-----------|--------------------------|--------------------------------------|
| `POST`    | `/api/calls`             | Upload an audio file                |
| `POST`    | `/api/videos/upload`     | Upload a video file                 |
| `POST`    | `/api/transcriptions`    | Transcribe an audio file            |
| `POST`    | `/api/summaries`         | Summarize a transcription           |

---

## License
MIT License © 2025 Max Dell-Thibodeau & Friends.