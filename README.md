# 🌦️ Weather Prediction Dashboard

A modern and interactive Weather Prediction Dashboard built using **Flask**, **HTML**, **CSS**, and **JavaScript**, powered by the **OpenWeather API**. The application provides real-time weather information, 5-day forecasts, city comparison, geolocation-based weather tracking, interactive maps, and animated weather visualizations.

---

## 🚀 Features

### 🌍 Real-Time Weather Data

* Current weather conditions for any city
* Temperature, humidity, wind speed, pressure, visibility, and cloud coverage
* Sunrise and sunset information
* "Feels Like" temperature calculation

### 📅 5-Day Forecast

* Extended weather forecast
* Daily weather summaries
* Forecast trend visualization

### 📍 Geolocation Support

* Detect user's current location
* Fetch weather data using GPS coordinates
* Reverse geocoding support

### 🔍 Smart City Search

* Search cities worldwide
* Auto-suggestions while typing
* Quick-access popular city buttons

### 🗺️ Interactive Weather Map

* Leaflet.js powered map
* Dynamic location tracking
* Multiple map controls and themes

### 📊 Weather Analytics

* Temperature and humidity trends
* Wind and precipitation analysis
* Pressure and cloud coverage monitoring
* Interactive charts using Chart.js

### ⚖️ Dual City Comparison

Compare weather conditions between two cities:

* Temperature
* Humidity
* Wind Speed
* Overall Weather Index

### ✨ Modern Animated UI

* Glassmorphism design
* Dynamic weather animations
* Interactive atmospheric simulations
* Responsive dashboard layout
* Smooth transitions and effects

---

## 🛠️ Technologies Used

### Backend

* Python
* Flask
* Flask-CORS

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### APIs & Libraries

* OpenWeather API
* Leaflet.js
* Chart.js
* Lucide Icons

---

## 📂 Project Structure

```text
Weather-Dashboard/
│
├── backend/
│   ├── main.py
│   ├── openweather_fetch.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Weather-Dashboard
```

### 2. Create Virtual Environment (Optional)

```bash
python -m venv venv
```

Activate the environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure OpenWeather API Key

Obtain an API key from OpenWeather and add it to your configuration file or environment variables as required by the project.

---

## ▶️ Running the Application

Start the Flask server:

```bash
python main.py
```

After the server starts successfully, open your browser and navigate to:

```text
http://127.0.0.1:5000
```

or

```text
http://localhost:5000
```

The Weather Prediction Dashboard will load automatically.

---

## 🌐 Available API Endpoints

### Current Weather

```http
GET /weather/<city>
```

Example:

```http
GET /weather/Chennai
```

---

### 5-Day Forecast

```http
GET /weather/forecast/<city>
```

---

### Weather by Coordinates

```http
GET /weather/coords/current/<lat>/<lon>
```

---

### Forecast by Coordinates

```http
GET /weather/coords/forecast/<lat>/<lon>
```

---

### City Search

```http
GET /weather/search/<query>
```

---

### Reverse Geocoding

```http
GET /weather/reverse/<lat>/<lon>
```

---

## 📈 Dashboard Components

* Hero Weather Card
* Atmospheric Diagnostics Panel
* Interactive Weather Map
* Forecast Dashboard
* Weather Trend Analytics
* Atmospheric Simulation Stage
* Notifications Panel
* Dual-City Comparison Tool

---

## 🔮 Future Enhancements

* Air Quality Index (AQI)
* Severe Weather Alerts
* Historical Weather Analysis
* User Accounts & Preferences
* Dark/Light Theme Toggle
* Weather Data Export (PDF/CSV)
* AI-Based Weather Insights

---

## 👨‍💻 Author

Developed as a Weather Prediction Dashboard project using Flask, OpenWeather API, HTML, CSS, and JavaScript to provide an engaging and interactive weather monitoring experience.

---

## 📜 License

This project is intended for educational and learning purposes.
