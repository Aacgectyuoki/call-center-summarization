# from transformers import pipeline

# transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-small")
# result = transcriber("Andrew Schmidt - NC Director.mp3")
# print(result["text"])
# import transformers
# from transformers import pipeline
# import torch
# import os

# # Check if GPU is available for faster processing
# device = 0 if torch.cuda.is_available() else -1

# # Initialize Whisper ASR model
# transcriber = pipeline(
#     "automatic-speech-recognition",
#     model="openai/whisper-small",  # Change to "openai/whisper-tiny" for faster processing
#     device=device  # Use GPU if available
# )

# # Define audio file path
# audio_file = "Andrew Schmidt - NC Director.mp3"

# # Check if the file exists
# if not os.path.exists(audio_file):
#     print(f"Error: File '{audio_file}' not found.")
# else:
#     try:
#         # Transcribe audio
#         result = transcriber(audio_file)
#         print("Transcription:", result["text"])
#     except Exception as e:
#         print(f"Error during transcription: {e}")

from transformers import pipeline
import torch
import os

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

    def transcribe_audio(self, file_path):
        """
        Transcribes an audio file and returns the text.
        Handles missing files & API failures.
        """
        if not os.path.exists(file_path):
            return f"Error: File '{file_path}' not found."

        try:
            result = self.transcriber(file_path, return_timestamps=True, generate_kwargs={"task": "transcribe", "language": "en"})
            return result["text"]
        except Exception as e:
            return f"Error during transcription: {e}"

# Usage
if __name__ == "__main__":
    audio_file = "youtube_audio.mp3"
    transcriber = Transcriber(model_size="openai/whisper-small")  # Change model size if needed
    transcription = transcriber.transcribe_audio(audio_file)
    print("Transcription:\n", transcription)
