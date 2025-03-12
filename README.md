# 📞 DTSummarizr - Transcription & Summarization System

A robust AI-powered call center transcription and summarization system. This project transcribes audio calls, processes the text, and provides summaries using AI-powered natural language processing.

---

## 📌 Features

✅ **Audio Transcription:** Convert call recordings into text using OpenAI Whisper.\
✅ **Summarization:** Generate concise summaries using OpenAI GPT models.\
✅ **Sentiment Analysis:** Detect the tone and sentiment of transcribed calls.\
✅ **Multi-Language Support:** Process audio in multiple languages.\
✅ **Database Storage:** Store transcriptions and summaries in MongoDB.\
✅ **Secure API Access:** Authenticate users via JWT-based security.

---

## 🛠️ Tech Stack

| **Component**      | **Technology Used**                                             |
| ------------------ | --------------------------------------------------------------- |
| **Backend**        | Node.js, Express.js                                             |
| **Frontend** (TBD) | React, Next.js                                                  |
| **Database**       | MongoDB (Mongoose)                                              |
| **File Storage**   | Multer, AWS S3                                                  |
| **Speech-to-Text** | OpenAI Whisper, Google Speech-to-Text, AWS Transcribe, Deepgram |
| **Summarization**  | OpenAI GPT                                                      |
| **NLP Processing** | spaCy, NLTK                                                     |
| **Authentication** | JWT, bcrypt                                                     |

---

## 🏠 Project Structure

```
📦 call-center-ai
 ┣ 📂 backend
 ┃ ┣ 📂 config
 ┃ ┃ ┗ 📜 db.js              		# MongoDB connection
 ┃ ┣ 📂 controllers
 ┃ ┃ ┣ 📜 authController.js  		# Handles authentication (JWT)
 ┃ ┃ ┣ 📜 callController.js  		# Manages call records
 ┃ ┃ ┣ 📜 summaryController.js 		# Handles summarization logic
 ┃ ┃ ┣ 📜 transcriptionController.js 	# Handles transcriptions (JS version)
 ┃ ┃ ┣ 📜 youtubeController.js 		# Handles YouTube transcription (JS)
 ┃ ┃ ┣ 📜 videoController.js 		# Handles video-to-audio conversion (JS)
 ┃ ┃ ┗ 📜 analyticsController.js 		# Sentiment & processing time tracking
 ┃ ┣ 📂 middleware
 ┃ ┃ ┣ 📜 authMiddleware.js   	# JWT authentication
 ┃ ┃ ┣ 📜 errorHandler.js     	# Handles errors globally
 ┃ ┃ ┗ 📜 timerMiddleware.js  	# Logs processing time for API requests
 ┃ ┣ 📂 models
 ┃ ┃ ┣ 📜 Call.js             		# Call schema (audio file metadata)
 ┃ ┃ ┣ 📜 File.js             		# File metadata schema
 ┃ ┃ ┣ 📜 Settings.js         	# User settings schema
 ┃ ┃ ┣ 📜 Summary.js          	# Summarization schema
 ┃ ┃ ┣ 📜 Transcription.js    	# Transcription schema
 ┃ ┃ ┣ 📜 User.js             	# User schema
 ┃ ┃ ┗ 📜 Video.js            	# Stores video metadata (file path, extracted audio)
 ┃ ┣ 📂 routes
 ┃ ┃ ┣ 📜 calls.js            		# Routes for handling calls
 ┃ ┃ ┣ 📜 summaries.js        	# Routes for managing summaries
 ┃ ┃ ┣ 📜 transcriptions.js   	# Routes for transcriptions (JS)
 ┃ ┃ ┣ 📜 youtube.js          	# Routes for YouTube video transcription (JS)
 ┃ ┃ ┗ 📜 video.js            	# Routes for video-to-audio conversion (JS)
 ┃ ┣ 📂 utils
 ┃ ┃ ┣ 📜 fileHandler.js      	# Handles file uploads (Multer)
 ┃ ┃ ┣ 📜 summaryUtils.js     	# Summarization helper functions
 ┃ ┃ ┣ 📜 transcribeUtils.js  	# Transcription functions (Whisper JS)
 ┃ ┃ ┣ 📜 nlpUtils.js         	# NLP-based text processing
 ┃ ┃ ┣ 📜 youtubeUtils.js     	# Downloads & extracts audio from YouTube videos (JS)
 ┃ ┃ ┗ 📜 videoUtils.js       	# Converts video files to audio (JS)
 ┃ ┣ 📂 uploads
 ┃ ┃ ┣ 📂 transcripts/        	# Stores generated transcription text files
 ┃ ┃ ┣ 📂 audio/              	# Stores extracted audio from YouTube & video files
 ┃ ┃ ┣ 📂 videos/             	# Stores uploaded video files before conversion
 ┃ ┃ ┣ 📜 sample_audio.mp3   	# Example audio file
 ┃ ┃ ┗ 📜 sample_video.mp4   	# Example video file
 ┃ ┣ 📂 python_scripts
 ┃ ┃ ┗ 📜 full_transcription.py 	# Python-based transcription & summarization (YouTube, MP4, MP3)
 ┃ ┃ 
 ┃ ┣ 📜 server.js             		# Main Express server file (JS API)
 ┃ ┣ 📜 requirements.txt      	# Python dependencies for `full_transcription.py`
 ┃ ┣ 📜 run_transcription.py    	# Python script wrapper to execute `full_transcription.py`
 ┃ ┣ 📜 .gitignore            		# Ignore node_modules, .env, uploads
 ┃ ┣ 📜 .env                  		# Environment variables
 ┃ ┗ 📜 package.json          	# Backend dependencies
 ┣ 📂 frontend (TBD)
 ┗ 📜 README.md                # Documentation
```

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/your-username/call-center-ai.git
cd call-center-ai
```

### 2️⃣ Install Backend Dependencies

```sh
cd backend
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the `backend` folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### 4️⃣ Run the Backend Server

```sh
npm start
```

---

## 🛋️ API Workflow

1️⃣ **File Upload**

- User uploads an audio file (`.mp3`, `.wav`) via API.
- Technology: Multer (Node.js file handling).

2️⃣ **Transcription Processing**

- Converts audio into text using OpenAI Whisper, AWS Transcribe, or Google Speech-to-Text.
- Stores transcription in MongoDB.

3️⃣ **Summarization & Analysis**

- OpenAI GPT generates a summary.
- Sentiment analysis runs on the transcription.

4️⃣ **API Response**

- The processed text and summary are sent to the user via API.

---

## 🛠️ API Endpoints

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| `POST` | `/api/auth/register`      | Register a new user          |
| `POST` | `/api/auth/login`         | Authenticate user (JWT)      |
| `POST` | `/api/calls`              | Upload a new call audio file |
| `GET`  | `/api/calls`              | Retrieve all call records    |
| `POST` | `/api/transcriptions`     | Transcribe an audio file     |
| `GET`  | `/api/transcriptions/:id` | Retrieve transcription by ID |
| `POST` | `/api/summaries`          | Summarize a transcription    |
| `GET`  | `/api/summaries/:id`      | Retrieve summary by ID       |

---

## 🤖 Testing with Postman

1️⃣ Start the backend server.\
2️⃣ Open **Postman** and send a `POST` request to `/api/calls` with an audio file.\
3️⃣ Wait for transcription and summarization to process.\
4️⃣ Fetch the summary with a `GET` request to `/api/summaries/:id`.

---

## 💬 Contributing

Want to contribute? Open an issue or submit a pull request!

---

## 🏆 Future Improvements

🚀 **Real-Time Transcription** (WebSockets for live call processing).\
🌍 **Multi-Language Support** (Translate transcriptions automatically).\
📊 **Advanced Analytics** (Track call sentiment trends).

---

## 🐝 License

MIT License © 2025 Call Center AI Team

---

This README provides all the necessary details to set up, run, and test the project. Let me know if you want any refinements! 🚀

