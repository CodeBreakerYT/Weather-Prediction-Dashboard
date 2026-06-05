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

def get_forecast(city):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?q={city}&appid={api_key}&units=metric"
    )

    response = requests.get(url)
    return response.json()

def get_weather_by_coords(lat, lon):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    )

    response = requests.get(url)
    return response.json()

def get_forecast_by_coords(lat, lon):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    )

    response = requests.get(url)
    return response.json()

def search_cities(query):
    # Try Nominatim first for highly detailed location and address resolution
    headers = {
        "User-Agent": "WeatherPredictionDashboard/2.0 (rishav.weather@example.com)"
    }
    nominatim_url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5&addressdetails=1"
    try:
        response = requests.get(nominatim_url, headers=headers, timeout=5)
        if response.status_code == 200:
            results = response.json()
            if results:
                formatted = []
                for item in results:
                    addr = item.get("address", {})
                    # Select the most specific location name for neighborhood-level accuracy
                    name = (
                        addr.get("suburb") or 
                        addr.get("neighbourhood") or 
                        addr.get("village") or 
                        addr.get("town") or 
                        addr.get("railway") or 
                        addr.get("city_district") or 
                        addr.get("city") or 
                        item.get("display_name").split(",")[0]
                    )
                    state = addr.get("state", "")
                    country = addr.get("country", "")
                    
                    formatted.append({
                        "name": name,
                        "lat": float(item.get("lat")),
                        "lon": float(item.get("lon")),
                        "state": state,
                        "country": country,
                        "display_name": item.get("display_name")
                    })
                return formatted
    except Exception as e:
        print("Nominatim search failed, falling back to OpenWeatherMap:", e)

    # Fallback to OpenWeatherMap direct geocoding
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    url = (
        f"https://api.openweathermap.org/geo/1.0/direct"
        f"?q={query}&limit=5&appid={api_key}"
    )
    try:
        response = requests.get(url, timeout=5)
        return response.json()
    except Exception:
        return []

def reverse_geocode(lat, lon):
    headers = {
        "User-Agent": "WeatherPredictionDashboard/2.0 (rishav.weather@example.com)"
    }
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1"
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            addr = data.get("address", {})
            # Get neighborhood/suburb/town
            name = (
                addr.get("suburb") or 
                addr.get("neighbourhood") or 
                addr.get("village") or 
                addr.get("town") or 
                addr.get("railway") or 
                addr.get("city_district") or 
                addr.get("city") or 
                addr.get("county") or 
                data.get("display_name").split(",")[0]
            )
            state = addr.get("state", "")
            country = addr.get("country", "")
            return {
                "name": name,
                "state": state,
                "country": country,
                "display_name": data.get("display_name")
            }
    except Exception as e:
        print("Nominatim reverse geocode error:", e)
    return None



