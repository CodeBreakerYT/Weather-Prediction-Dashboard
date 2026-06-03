from flask import Flask, jsonify
from flask_cors import CORS

from openweather_fetch import get_weather

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Weather API Running"

@app.route("/weather/<city>")
def weather(city):
    data = get_weather(city)
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)