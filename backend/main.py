from flask import Flask
import random
import requests
import os
from io import BytesIO

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Hello, World!"

@app.route("/random-street-view")
def random_street_view():
    # Generate random coordinates
    lat = random.uniform(-85, 85)  # Valid latitude range
    lng = random.uniform(-180, 180)  # Valid longitude range
    
    # Google Maps Street View API endpoint
    api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
    url = f"https://maps.googleapis.com/maps/api/streetview"
    
    # Parameters for the Street View request
    params = {
        'size': '600x400',  # Image size
        'location': f'{lat},{lng}',
        'key': api_key,
        'return_error_code': True  # To handle locations without street view
    }
    
    try:
        # Make request to Google Street View API
        response = requests.get(url, params=params)
        
        # Check if we got a valid image
        if response.headers.get('content-type') == 'image/jpeg':
            return send_file(
                BytesIO(response.content),
                mimetype='image/jpeg'
            )
        else:
            # If no street view available, try again with new coordinates
            return random_street_view()
            
    except Exception as e:
        return {"error": str(e)}, 500



if __name__ == "__main__":
    app.run(debug=True)
