from transformers import pipeline

transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-small")
result = transcriber("Andrew Schmidt - NC Director.mp3")
print(result["text"])
