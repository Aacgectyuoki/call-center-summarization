import requests

file_path = "uploads/Andrew Schmidt - NC Director.mp3"
url = "http://localhost:5000/api/transcriptions/upload"

with open(file_path, "rb") as f:
    response = requests.post(url, files={"audio": f})

print(response.json())
