import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Read the transcription file
file_path = "1741400945950.txt"

with open(file_path, "r") as f:
    transcription_text = f.read()

# OpenAI GPT prompt for summarization (New API Format)
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are an assistant that summarizes transcriptions."},
        {"role": "user", "content": f"Summarize the following transcription in concise bullet points:\n\n{transcription_text}"}
    ],
    temperature=0.7,
    max_tokens=150
)

# Extract the summary
summary = response.choices[0].message.content.strip()

# Save the summary
summary_file = file_path.replace(".txt", "_summary.txt")
with open(summary_file, "w") as f:
    f.write(summary)

print(f"✅ Summary saved to {summary_file}")
