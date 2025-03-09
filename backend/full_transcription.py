import os
import subprocess
from pytube import YouTube
from pydub import AudioSegment
from transformers import pipeline
import torch

class Transcriber:
    def __init__(self, model_size="openai/whisper-small"):
        """
        Initialize the speech recognition model.
        Uses GPU if available for faster processing.
        """
        self.device = 0 if torch.cuda.is_available() else -1
        self.transcriber = pipeline(
            "automatic-speech-recognition", model=model_size, device=self.device
        )
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

    def convert_to_mp3(self, file_path):
        """
        Converts an MP4 video file to an MP3 audio file using pydub.
        """
        try:
            mp3_path = file_path.replace(".mp4", ".mp3")
            audio = AudioSegment.from_file(file_path, format="mp4")
            audio.export(mp3_path, format="mp3")
            return mp3_path
        except Exception as e:
            return f"Error converting to MP3: {e}"

    def download_youtube_audio(self, url):
        """
        Downloads audio from a YouTube video and converts it to MP3 using yt-dlp.
        """
        try:
            output_file = "youtube_audio.mp3"
            command = ["yt-dlp", "-f", "bestaudio", "-x", "--audio-format", "mp3", "-o", output_file, url]
            subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return output_file
        except Exception as e:
            return f"Error downloading YouTube video: {e}"

    def transcribe_audio(self, file_path):
        """
        Transcribes an MP3 file and returns the text.
        """
        if not os.path.exists(file_path):
            return f"Error: File '{file_path}' not found."

        try:
            result = self.transcriber(file_path, return_timestamps=True, generate_kwargs={"task": "transcribe", "language": "en"})
            return result["text"]
        except Exception as e:
            return f"Error during transcription: {e}"

    def summarize_text(self, text, max_length=1000):
        """
        Summarizes the given text.
        """
        try:
            prompt = (
                "You are an assistant that summarizes transcriptions. Please extract and summarize all key details from the following transcription while preserving the intent and tone. Ensure no critical points are lost and keep the summary structured into clear bullet points, each starting with '•' and a new line before it."
            )
            summary = self.summarizer(f"{prompt}\n\n{text}", max_length=max_length, min_length=50, do_sample=False)
            return summary[0]['summary_text']
        except Exception as e:
            return f"Error during summarization: {e}"

    def save_to_file(self, content, file_path):
        """
        Saves the given content to a text file.
        """
        with open(file_path, "w") as f:
            f.write(content)

    def transcribe_and_summarize(self, file_path):
        """
        Transcribes an MP3 file and summarizes it.
        """
        transcription = self.transcribe_audio(file_path)
        if "Error" in transcription:
            return transcription
        summary = self.summarize_text(transcription)
        return transcription, summary

    def process_video(self, file_path):
        """
        Converts MP4 to MP3, transcribes, and summarizes.
        """
        print(f"Converting {file_path} to MP3...")
        mp3_file = self.convert_to_mp3(file_path)

        if "Error" in mp3_file:
            return mp3_file

        print(f"Transcribing and summarizing {file_path}...")
        transcription, summary = self.transcribe_and_summarize(mp3_file)
        self.save_to_file(transcription, "transcription.txt")
        self.save_to_file(summary, "summary.txt")
        return transcription, summary

    def process_audio(self, file_path):
        """
        Transcribes and summarizes an MP3 file.
        """
        print(f"Transcribing and summarizing {file_path}...")
        transcription, summary = self.transcribe_and_summarize(file_path)
        self.save_to_file(transcription, "transcription.txt")
        self.save_to_file(summary, "summary.txt")
        return transcription, summary

    def process_youtube(self, url):
        """
        Downloads YouTube video, extracts MP3, transcribes, and summarizes.
        """
        print(f"Downloading and processing YouTube video: {url}...")
        mp3_file = self.download_youtube_audio(url)

        if "Error" in mp3_file:
            return mp3_file

        print("Transcribing and summarizing YouTube audio...")
        transcription, summary = self.transcribe_and_summarize(mp3_file)
        self.save_to_file(transcription, "transcription.txt")
        self.save_to_file(summary, "summary.txt")
        return transcription, summary


# **Run Tests**
if __name__ == "__main__":
    transcriber = Transcriber(model_size="openai/whisper-small")

    print("\n🎤 **Choose an option for transcription & summarization:**")
    print("1️⃣ - YouTube Video")
    print("2️⃣ - Local Video File (MP4)")
    print("3️⃣ - Local Audio File (MP3)")
    
    choice = input("\nEnter the number of your choice: ")

    if choice == "1":
        # **Test YouTube Video**
        youtube_summary = transcriber.process_youtube("https://www.youtube.com/watch?v=klnjEOo8QOY")
        print("\n📌 **YouTube Video Summary:**\n", youtube_summary)

    elif choice == "2":
        # **Test MP4 File (mongoDB.mp4)**
        video_summary = transcriber.process_video("mongoDB.mp4")
        print("\n📌 **MP4 Video Summary:**\n", video_summary)

    elif choice == "3":
        # **Test MP3 File (Andrew Schmidt - NC Director.mp3)**
        audio_summary = transcriber.process_audio("Andrew Schmidt - NC Director.mp3")
        print("\n📌 **MP3 Audio Summary:**\n", audio_summary)

    else:
        print("\n❌ Invalid choice. Please enter 1, 2, or 3.")