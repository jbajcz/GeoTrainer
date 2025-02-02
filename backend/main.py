from flask import Flask, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/haiku', methods=['GET'])
def generate_haiku():
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a haiku generator. Create a haiku about artificial intelligence."},
                {"role": "user", "content": "Generate a haiku about AI."}
            ]
        )
        
        haiku = response.choices[0].message.content
        return jsonify({"haiku": haiku})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
