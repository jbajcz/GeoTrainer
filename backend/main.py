from flask import Flask, jsonify
import json
import os

app = Flask(__name__)

# Load the map style JSON
with open('../maps-style.json', 'r') as style_file:
    map_style = json.load(style_file)

@app.route('/api/map-style', methods=['GET'])
def get_map_style():
    return jsonify(map_style)

@app.route('/')
def home():
    return "Map Style API Server"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
