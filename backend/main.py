from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request
import json
import os
import base64
from openai import OpenAI
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure OpenAI API
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    print('analyze_image');
    if 'file' not in request.files or 'context' not in request.form:
        return jsonify({'error': 'No file or context provided'}), 400
    
    file = request.files['file']
    context = request.form['context']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Open and encode the image
            with open(filepath, "rb") as image_file:
                response = client.beta.chat.completions.parse(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"First, determine if this image representsa {context}. If yes, describe what region(s) of the world would typically have architecture, vegetation, or features like this in 1 short phrase (do not include yes or no). If no, respond with 'INVALID'."
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64.b64encode(image_file.read()).decode()}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=100,
                    # response_format={ "type": "json_object" }
                )
                
            description = response.choices[0].message.content
            print('description', description)
            
            # Clean up uploaded file
            os.remove(filepath)
            
            if description.strip().upper() == 'INVALID':
                return jsonify({
                    'description': None
                })
                
            return jsonify({
                'description': description
            })
            
        except Exception as e:
            # Clean up uploaded file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'error': 'Invalid file type'}), 400
if __name__ == '__main__':
    app.run(debug=True, port=5000)
