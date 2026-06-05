import sys
from pathlib import Path

# Add backend directory to path to enable local module imports in Vercel serverless environment
sys.path.append(str(Path(__file__).resolve().parent))

from flask import Flask, jsonify
from flask_cors import CORS
from openweather_fetch import get_weather, get_forecast, get_weather_by_coords, get_forecast_by_coords, search_cities, reverse_geocode

backend_dir = Path(__file__).resolve().parent
frontend_dir = backend_dir.parent / "frontend"

app = Flask(__name__, static_folder=str(frontend_dir), static_url_path="")
CORS(app)

@app.route("/")
def home():
    try:
        return app.send_static_file("index.html")
    except Exception:
        return "Weather API Running (frontend/index.html not found)"

@app.route("/weather/<city>")
def weather(city):
    data = get_weather(city)
    return jsonify(data)

@app.route("/weather/forecast/<city>")
def weather_forecast(city):
    data = get_forecast(city)
    return jsonify(data)

@app.route("/weather/coords/current/<lat>/<lon>")
def weather_coords(lat, lon):
    data = get_weather_by_coords(lat, lon)
    return jsonify(data)

@app.route("/weather/coords/forecast/<lat>/<lon>")
def forecast_coords(lat, lon):
    data = get_forecast_by_coords(lat, lon)
    return jsonify(data)

@app.route("/weather/search/<query>")
def weather_search(query):
    data = search_cities(query)
    return jsonify(data)

@app.route("/weather/reverse/<lat>/<lon>")
def weather_reverse(lat, lon):
    data = reverse_geocode(lat, lon)
    return jsonify(data)



if __name__ == "__main__":
    app.run(debug=True)