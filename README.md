# Summarizr — MP3/MP4 AI Summarization App

DT Summarizr is a full-stack AI application that allows users to **upload MP3 or MP4 files**, **transcribe them using AWS**, and **generate AI-powered summaries** using OpenAI (through LangChain). Track transcription progress in real-time through AWS CloudWatch and receive organized, bullet-pointed summaries with technical definitions.

---

## Tech Stack

**Frontend**  
- React 18 + Vite  
- TailwindCSS
- AWS CloudWatch SDK  
- Axios

**Backend**  
- Node.js + Express.js  
- MongoDB + Mongoose  
- AWS S3, Transcribe, Lambda, CloudWatch  
- LangChain (OpenAI integration)  
- JWT Auth  
- Modular MVC structure

---

## Features
- Upload **MP3** or **MP4** files
- Auto-transcribe using **AWS Transcribe**
- Generate summaries through **LangChain & OpenAI**
- Real-time progress through **AWS CloudWatch**
- JWT-authenticated API (with `.env` token fallback)
- Technical term highlighting + formatting
- File storage on **AWS S3**, data stored in **MongoDB**

---

## How the AI Works

DT Summarizr follows a streamlined AI pipeline to transcribe and summarize MP3/MP4 files:

1. **User Uploads File**  
   The frontend allows users to upload `.mp3` or `.mp4` files.

2. **File Sent to Backend**  
   The uploaded file is sent to the **Express.js** backend through a POST request.

3. **Stored in AWS S3**  
   The backend stores the file securely in an **AWS S3** bucket.

4. **Transcription Triggered**  
   The backend initiates a transcription job using **AWS Transcribe**.

5. **Progress Tracked through CloudWatch**  
   Real-time transcription progress is monitored using **AWS CloudWatch Logs**.

6. **Transcription Completed**  
   When transcription is complete, the text transcript is retrieved and saved to **MongoDB**.

7. **LangChain Summarization Begins**  
   The transcript is sent to **LangChain**, which uses **OpenAI** to generate:
   - Bullet-point summaries  
   - Section breakdowns  
   - Definitions for key phrases and technical terms

8. **Summary Returned to Frontend**  
   The final structured summary is returned to the frontend and presented to the user.

---

## Setup Instructions

1. Clone the repo:
    ```bash
    git clone https://github.com/Aacgectyuoki/call-center-summarization.git
    cd call-center-summarization
    ```

### Backend

1. Open a terminal to go to backend:
    ```bash
    cd backend
    ```

2. Create a .env file and add:
    ```
    PORT=5000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret

    AWS_REGION=your-region
    AWS_ACCESS_KEY_ID=your_key
    AWS_SECRET_ACCESS_KEY=your_secret

    OPENAI_API_KEY=your_openai_key
    ```

3. Install dependencies and start the server:
    ```bash
    npm install
    node server.js
    ```


### Frontend

1. Open a terminal to go to frontend:
    ```bash
    cd frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Visit http://localhost:5173

---

## Authentication

The backend supports JWT authentication:
- Some endpoints require a token through the Authorization header.
- You may use a static fallback token during testing through .env.

---

## Testing

Backend:
Use Postman or any REST client to test routes such as:
- `POST /api/aws/upload`
- `GET /api/aws/transcription-status`
- `POST /api/aws/summarize`

---

## Project Structure

### Backend
    controllers/      # Logic for each feature (auth, AWS, summarize, etc)
    routes/           # Route definitions
    models/           # Mongoose schemas
    middleware/       # JWT auth, error logging, timers
    utils/            # AWS, summarizer, progress, file handler
    config/           # DB & AWS config

### Frontend
    src/
    components/     # FileUploader and future components
    App.jsx         # Main app logic
    api.js          # Axios requests
    config.js       # API endpoints
    awsCloudWatchConfig.js  # CloudWatch metrics (also in backend)
    styles/         # Custom CSS + Tailwind

---

## Full Project Structure

### backend/
    backend/
    ├── config/
    │   ├── awsConfig.js
    │   ├── db.js
    │   └── envConfig.js
    ├── controllers/
    │   ├── analyticsController.js
    │   ├── authController.js
    │   ├── awsLambdaController.js
    │   ├── awsS3Controller.js
    │   ├── awsTranscribeController.js
    │   ├── callController.js
    │   ├── summaryController.js
    │   ├── transcriptionController.js
    │   ├── videoController.js
    │   └── webhookController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── errorHandler.js
    │   ├── logger.js
    │   └── timerMiddleware.js
    ├── models/
    │   ├── AwsS3File.js
    │   ├── AwsTranscription.js
    │   ├── Call.js
    │   ├── File.js
    │   ├── Settings.js
    │   ├── Summary.js
    │   ├── Transcription.js
    │   ├── TranscriptionHistory.js
    │   ├── User.js
    │   └── Video.js
    ├── routes/
    │   ├── analytics.js
    │   ├── auth.js
    │   ├── awsLambda.js
    │   ├── awsRoutes.js
    │   ├── awsS3.js
    │   ├── awsTranscribe.js
    │   ├── calls.js
    │   ├── mongoCheck.js
    │   ├── summaries.js
    │   ├── transcriptions.js
    │   └── video.js
    ├── utils/
    │   ├── audioUtils.js
    │   ├── awsLambdaUtils.js
    │   ├── awsS3Utils.js
    │   ├── awsTranscribeUtils.js
    │   ├── cloudWatchUtils.js
    │   ├── fileHandler.js
    │   ├── jwtUtils.js
    │   ├── nlpUtils.js
    │   ├── predictionUtils.js
    │   ├── progressTracker.js
    │   ├── streamingTranscribe.js
    │   ├── summarizer.js
    │   ├── transcriptionUtils.js
    │   └── videoUtils.js
    ├── langchain.d.ts
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json

### frontend/
    frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── api.js
    │   ├── awsCloudWatchConfig.js
    │   ├── config.js
    │   ├── components/
    │   │   └── FileUploader.jsx
    │   ├── index.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   ├── styles/
    │   │   └── index.css
    │   └── vite-env.d.ts
    ├── package.json
    ├── package-lock.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    ├── README.md

---

## Future Improvements
- Built-in audio recorder
- Video context-aware summarization (movement/audio)
- Summary export as PDF or DOCX, with text-image recognition (correct me)
- User dashboard and upload history

---

## Contributing
PRs are welcome!
If you want to contribute:
1. Fork the repo
2. Create a new branch
3. Submit a pull request

