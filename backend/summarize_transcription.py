import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set the OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Read the transcription file
file_path = "1741400945950.txt"

with open(file_path, "r") as f:
    transcription_text = f.read()

# OpenAI GPT prompt for summarization (New API Format)
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are an assistant that summarizes transcriptions. Please extract and summarize all key details from the following transcription while preserving the intent and tone. Ensure no critical points are lost and keep the summary structured into clear bullet points."},
        {"role": "user", "content": transcription_text}
    ],
    temperature=0.7
    # ,
    # max_tokens=150
)

# Extract the summary
summary = response.choices[0].message['content'].strip()

# Save the summary
summary_file = file_path.replace(".txt", "_summary.txt")
with open(summary_file, "w") as f:
    f.write(summary)

print(f"✅ Summary saved to {summary_file}")