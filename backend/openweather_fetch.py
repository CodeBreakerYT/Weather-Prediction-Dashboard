import requests
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from the .env file in the project root if not running on Vercel
if not os.getenv("VERCEL"):
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)

def get_weather(city):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={api_key}&units=metric"
    )

    response = requests.get(url)
    return response.json()
