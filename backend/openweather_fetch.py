import requests
from dotenv import load_dotenv
import os
import time
import math
from pathlib import Path

# Load environment variables from the .env file in the project root if not running on Vercel
if not os.getenv("VERCEL"):
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)

# ==========================================================================
# MOCK DATA GENERATOR ENGINE (FOR OFFLINE / NO-KEY DEMO MODE)
# ==========================================================================

def hash_city(city_name):
    """Deterministic hash based on city name to return consistent results."""
    val = sum(ord(c) for c in city_name)
    return val % 100

def get_city_details(city, lat=None, lon=None):
    """Get coordinates and baseline parameters for popular and arbitrary cities."""
    city_lower = city.strip().lower()
    
    cities_db = {
        "chennai": {"lat": 13.0827, "lon": 80.2707, "country": "IN", "timezone": 19800, "temp_base": 32, "desc": "Scattered Clouds", "main": "Clouds"},
        "london": {"lat": 51.5074, "lon": -0.1278, "country": "GB", "timezone": 3600, "temp_base": 14, "desc": "Light Drizzle", "main": "Rain"},
        "new york": {"lat": 40.7128, "lon": -74.0060, "country": "US", "timezone": -14400, "temp_base": 20, "desc": "Clear Sky", "main": "Clear"},
        "tokyo": {"lat": 35.6762, "lon": 139.6503, "country": "JP", "timezone": 32400, "temp_base": 18, "desc": "Broken Clouds", "main": "Clouds"},
        "paris": {"lat": 48.8566, "lon": 2.3522, "country": "FR", "timezone": 7200, "temp_base": 17, "desc": "Few Clouds", "main": "Clouds"},
        "sydney": {"lat": -33.8688, "lon": 151.2093, "country": "AU", "timezone": 36000, "temp_base": 16, "desc": "Heavy Storms", "main": "Thunderstorm"},
    }
    
    # If coordinates are provided, check proximity first to associate with standard cities
    if lat is not None and lon is not None:
        lat_val = float(lat)
        lon_val = float(lon)
        for name, db_city in cities_db.items():
            if abs(db_city["lat"] - lat_val) < 2.0 and abs(db_city["lon"] - lon_val) < 2.0:
                ret = db_city.copy()
                ret["lat"] = lat_val
                ret["lon"] = lon_val
                return ret

    for k, v in cities_db.items():
        if k in city_lower or city_lower in k:
            return v.copy()
            
    # Default fallback generator for other search queries or arbitrary coordinates
    h = hash_city(city)
    lat_val = float(lat) if lat is not None else (20.0 + (h % 30) - 15.0)
    lon_val = float(lon) if lon is not None else (70.0 + (h % 50) - 25.0)
    
    # Infer country and timezone based on coordinates
    country = "US"
    timezone = -18000
    # India bounding box (approximate)
    if 6.0 <= lat_val <= 38.0 and 67.0 <= lon_val <= 98.0:
        country = "IN"
        timezone = 19800
    elif 49.0 <= lat_val <= 61.0 and -8.0 <= lon_val <= 2.0:
        country = "GB"
        timezone = 3600
    elif 30.0 <= lat_val <= 45.0 and 125.0 <= lon_val <= 145.0:
        country = "JP"
        timezone = 32400
    elif 42.0 <= lat_val <= 51.0 and -5.0 <= lon_val <= 10.0:
        country = "FR"
        timezone = 7200
    elif -41.0 <= lat_val <= -10.0 and 112.0 <= lon_val <= 154.0:
        country = "AU"
        timezone = 36000
        
    temp_base = 12 + (h % 22)
    mains = ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm"]
    descs = ["clear sky", "broken clouds", "moderate rain", "light snow", "thunderstorm with heavy rain"]
    idx = h % len(mains)
    
    return {
        "lat": lat_val,
        "lon": lon_val,
        "country": country,
        "timezone": timezone,
        "temp_base": temp_base,
        "desc": descs[idx],
        "main": mains[idx]
    }

def generate_mock_weather_data(city_name, lat=None, lon=None):
    details = get_city_details(city_name, lat, lon)
    
    h = hash_city(city_name)
    temp = details["temp_base"]
    humidity = 40 + (h % 50)
    pressure = 1005 + (h % 15)
    wind_speed = 2.0 + (h % 10)
    wind_deg = (h * 15) % 360
    clouds_all = 10 + (h % 80)
    
    current_time = int(time.time())
    sunrise = current_time - 36000 + details["timezone"]
    sunset = current_time + 10000 + details["timezone"]
    
    return {
        "coord": {"lon": details["lon"], "lat": details["lat"]},
        "weather": [{"id": 800 + (h % 50), "main": details["main"], "description": details["desc"], "icon": "04d"}],
        "base": "stations",
        "main": {
            "temp": temp,
            "feels_like": temp + (2 if humidity > 65 else -1),
            "temp_min": temp - 2,
            "temp_max": temp + 2,
            "pressure": pressure,
            "humidity": humidity
        },
        "visibility": max(1000, 10000 - (humidity * 60)),
        "wind": {"speed": wind_speed, "deg": wind_deg, "gust": wind_speed * 1.3},
        "clouds": {"all": clouds_all},
        "dt": current_time,
        "sys": {
            "type": 1,
            "id": 1234,
            "country": details["country"],
            "sunrise": sunrise,
            "sunset": sunset
        },
        "timezone": details["timezone"],
        "id": 123456 + h,
        "name": city_name,
        "cod": 200
    }

def generate_mock_forecast_data(city_name, lat=None, lon=None):
    details = get_city_details(city_name, lat, lon)
        
    current_time = int(time.time())
    forecast_list = []
    
    # 40 points, every 3 hours (3 hours = 10800 seconds)
    for i in range(40):
        dt = current_time + i * 10800
        # Diurnal temperature changes
        hour_angle = (2 * math.pi * (dt + details["timezone"])) / 86400
        diurnal_temp = math.sin(hour_angle - math.pi/2) * 5
        
        # Slow multiday trend
        trend_temp = math.sin(i / 10) * 3
        
        temp = round(details["temp_base"] + diurnal_temp + trend_temp, 1)
        humidity = min(100, max(20, round(60 - diurnal_temp * 4 + math.sin(i / 5) * 10)))
        pressure = round(1010 + math.cos(i / 8) * 5)
        wind_speed = round(3.0 + abs(math.sin(i / 4)) * 6, 1)
        clouds_all = min(100, max(0, round(50 + math.sin(i / 3) * 40)))
        
        # Precip probability
        pop = round(max(0.0, min(1.0, (humidity - 35) / 65)), 2)
        
        weather_main = details["main"]
        weather_desc = details["desc"]
        if pop > 0.5:
            weather_main = "Rain"
            weather_desc = "moderate rain"
        elif clouds_all > 75:
            weather_main = "Clouds"
            weather_desc = "overcast clouds"
        elif clouds_all < 15:
            weather_main = "Clear"
            weather_desc = "clear sky"
            
        forecast_list.append({
            "dt": dt,
            "main": {
                "temp": temp,
                "feels_like": round(temp + (1.5 if humidity > 60 else -0.5), 1),
                "temp_min": temp - 1.2,
                "temp_max": temp + 1.2,
                "pressure": pressure,
                "humidity": humidity
            },
            "weather": [{"id": 800 if weather_main == "Clear" else (803 if weather_main == "Clouds" else 500), "main": weather_main, "description": weather_desc, "icon": "04d"}],
            "clouds": {"all": clouds_all},
            "wind": {"speed": wind_speed, "deg": 180},
            "visibility": 10000,
            "pop": pop,
            "dt_txt": time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(dt))
        })
        
    return {
        "cod": "200",
        "message": 0,
        "cnt": 40,
        "list": forecast_list,
        "city": {
            "id": 123456 + hash_city(city_name),
            "name": city_name,
            "coord": {"lat": details["lat"], "lon": details["lon"]},
            "country": details["country"],
            "population": 1000000,
            "timezone": details["timezone"],
            "sunrise": current_time - 36000 + details["timezone"],
            "sunset": current_time + 10000 + details["timezone"]
        }
    }

# ==========================================================================
# PUBLIC API FUNCTIONS
# ==========================================================================

def get_weather(city):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    if not api_key or api_key == "ENTER YOUR API KEY" or len(api_key.strip()) < 5:
        return generate_mock_weather_data(city)
        
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if response.status_code == 200 and str(data.get("cod")) == "200":
            return data
    except Exception as e:
        print(f"API Error in get_weather, using fallback: {e}")
    return generate_mock_weather_data(city)

def get_forecast(city):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    if not api_key or api_key == "ENTER YOUR API KEY" or len(api_key.strip()) < 5:
        return generate_mock_forecast_data(city)
        
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if response.status_code == 200 and str(data.get("cod")) == "200":
            return data
    except Exception as e:
        print(f"API Error in get_forecast, using fallback: {e}")
    return generate_mock_forecast_data(city)

def get_weather_by_coords(lat, lon):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    if not api_key or api_key == "ENTER YOUR API KEY" or len(api_key.strip()) < 5:
        return generate_mock_weather_data(f"Coords-{str(lat)[:6]}-{str(lon)[:6]}", lat, lon)
        
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if response.status_code == 200 and str(data.get("cod")) == "200":
            return data
    except Exception as e:
        print(f"API Error in get_weather_by_coords, using fallback: {e}")
    return generate_mock_weather_data(f"Coords-{str(lat)[:6]}-{str(lon)[:6]}", lat, lon)

def get_forecast_by_coords(lat, lon):
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    if not api_key or api_key == "ENTER YOUR API KEY" or len(api_key.strip()) < 5:
        return generate_mock_forecast_data(f"Coords-{str(lat)[:6]}-{str(lon)[:6]}", lat, lon)
        
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if response.status_code == 200 and str(data.get("cod")) == "200":
            return data
    except Exception as e:
        print(f"API Error in get_forecast_by_coords, using fallback: {e}")
    return generate_mock_forecast_data(f"Coords-{str(lat)[:6]}-{str(lon)[:6]}", lat, lon)

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
        print("Nominatim search failed, trying fallback options:", e)

    # Fallback to OpenWeatherMap direct geocoding
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    if api_key and api_key != "ENTER YOUR API KEY" and len(api_key.strip()) >= 5:
        url = f"https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={api_key}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
        except Exception:
            pass
            
    # Local fallback geocoding engine (so they can search popular/random cities even offline)
    mock_cities = [
        {"name": "Chennai", "lat": 13.0827, "lon": 80.2707, "state": "Tamil Nadu", "country": "India", "display_name": "Chennai, Tamil Nadu, India"},
        {"name": "London", "lat": 51.5074, "lon": -0.1278, "state": "England", "country": "United Kingdom", "display_name": "London, Greater London, United Kingdom"},
        {"name": "New York", "lat": 40.7128, "lon": -74.0060, "state": "New York", "country": "United States", "display_name": "New York City, New York, United States"},
        {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503, "state": "Tokyo", "country": "Japan", "display_name": "Tokyo, Kanto, Japan"},
        {"name": "Paris", "lat": 48.8566, "lon": 2.3522, "state": "Île-de-France", "country": "France", "display_name": "Paris, Île-de-France, France"},
        {"name": "Sydney", "lat": -33.8688, "lon": 151.2093, "state": "New South Wales", "country": "Australia", "display_name": "Sydney, New South Wales, Australia"}
    ]
    query_lower = query.strip().lower()
    matches = [c for c in mock_cities if query_lower in c["name"].lower() or query_lower in c["display_name"].lower()]
    if matches:
        return matches
        
    h = hash_city(query)
    lat = 20.0 + (h % 30) - 15.0
    lon = 70.0 + (h % 50) - 25.0
    return [{
        "name": query.capitalize(),
        "lat": lat,
        "lon": lon,
        "state": "Simulated Region",
        "country": "United States",
        "display_name": f"{query.capitalize()}, Simulated Region, United States"
    }]

def reverse_geocode(lat, lon):
    # Try Nominatim first
    headers = {
        "User-Agent": "WeatherPredictionDashboard/2.0 (rishav.weather@example.com)"
    }
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1"
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data:
                addr = data.get("address", {})
                suburb = addr.get("suburb") or addr.get("neighbourhood") or addr.get("village") or addr.get("town")
                city = addr.get("city") or addr.get("county") or addr.get("city_district") or addr.get("state")
                country = addr.get("country")
                
                parts = []
                if suburb:
                    parts.append(suburb)
                if city and city != suburb:
                    parts.append(city)
                if country:
                    parts.append(country)
                
                formatted_name = ", ".join(parts) if parts else data.get("display_name").split(",")[0]
                
                return {
                    "name": formatted_name,
                    "state": addr.get("state", ""),
                    "country": addr.get("country_code", "IN").upper(),
                    "display_name": data.get("display_name")
                }
    except Exception as e:
        print("Nominatim reverse geocode error, checking fallback:", e)

    # Fallback to OpenWeatherMap Reverse Geocoding API
    api_key = os.getenv("OPEN_WEATHER_MAP_API_KEY")
    if api_key and api_key != "ENTER YOUR API KEY" and len(api_key.strip()) >= 5:
        try:
            owm_url = f"https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={api_key}"
            owm_response = requests.get(owm_url, timeout=5)
            if owm_response.status_code == 200:
                owm_data = owm_response.json()
                if owm_data and isinstance(owm_data, list) and len(owm_data) > 0:
                    loc = owm_data[0]
                    name = loc.get("name")
                    state = loc.get("state", "")
                    country = loc.get("country", "")
                    display_name = f"{name}"
                    if state:
                        display_name += f", {state}"
                    if country:
                        display_name += f", {country}"
                    return {
                        "name": display_name,
                        "state": state,
                        "country": country,
                        "display_name": display_name
                    }
        except Exception as owm_e:
            print("OpenWeatherMap reverse geocode error:", owm_e)
            
    # Mock reverse geocode fallback
    lat_val = float(lat)
    lon_val = float(lon)
    mock_cities = [
        {"name": "Chennai", "lat": 13.0827, "lon": 80.2707, "state": "Tamil Nadu", "country": "India", "country_code": "IN", "display_name": "Chennai, Tamil Nadu, India", "suburb": "Urapakkam"},
        {"name": "London", "lat": 51.5074, "lon": -0.1278, "state": "England", "country": "United Kingdom", "country_code": "GB", "display_name": "London, Greater London, United Kingdom", "suburb": "Westminster"},
        {"name": "New York", "lat": 40.7128, "lon": -74.0060, "state": "New York", "country": "United States", "country_code": "US", "display_name": "New York City, New York, United States", "suburb": "Manhattan"},
        {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503, "state": "Tokyo", "country": "Japan", "country_code": "JP", "display_name": "Tokyo, Kanto, Japan", "suburb": "Shibuya"},
        {"name": "Paris", "lat": 48.8566, "lon": 2.3522, "state": "Île-de-France", "country": "France", "country_code": "FR", "display_name": "Paris, Île-de-France, France", "suburb": "Montmartre"},
        {"name": "Sydney", "lat": -33.8688, "lon": 151.2093, "state": "New South Wales", "country": "Australia", "country_code": "AU", "display_name": "Sydney, New South Wales, Australia", "suburb": "Newtown"}
    ]
    
    for c in mock_cities:
        if abs(c["lat"] - lat_val) < 2.0 and abs(c["lon"] - lon_val) < 2.0:
            return {
                "name": f"{c['suburb']}, {c['name']}, {c['country']}",
                "state": c["state"],
                "country": c["country_code"],
                "display_name": c["display_name"]
            }
            
    h = int(abs(lat_val * 100) + abs(lon_val * 100))
    city_name = f"Region-{h % 1000}"
    display_name = f"{city_name} (GPS {lat_val:.2f}, {lon_val:.2f})"
    
    # Infer country and country name based on coordinates
    country_code = "US"
    country_name = "United States"
    if 6.0 <= lat_val <= 38.0 and 67.0 <= lon_val <= 98.0:
        country_code = "IN"
        country_name = "India"
    elif 49.0 <= lat_val <= 61.0 and -8.0 <= lon_val <= 2.0:
        country_code = "GB"
        country_name = "United Kingdom"
    elif 30.0 <= lat_val <= 45.0 and 125.0 <= lon_val <= 145.0:
        country_code = "JP"
        country_name = "Japan"
        
    return {
        "name": f"Local Area, {city_name}, {country_name}",
        "state": "Simulated State",
        "country": country_code,
        "display_name": display_name
    }
