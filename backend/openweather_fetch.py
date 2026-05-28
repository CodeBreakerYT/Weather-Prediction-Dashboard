import requests
from tkinter import *
import math
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from the .env file in the project root
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY") or os.getenv("OPENWEATHER_MAP_API_KEY")



#OPEN_WEATHER_MAP_API_KEY 
def get_weather(api_key, city):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}"

    response = requests.get(url).json()
    return response



city_name = "Chennai, India"
r=get_weather(api_key, city_name )
print(r)