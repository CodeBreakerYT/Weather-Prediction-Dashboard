# Environment Setup Guide

## Required Environment Variables

### Google Maps API Key (REQUIRED for location map feature)

1. **Get your API key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Search for "Maps JavaScript API"
   - Click "Enable"
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the generated API key

2. **Add to your project:**
   ```bash
   # .env.local file
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Enable required APIs in Google Cloud:**
   - Maps JavaScript API
   - Geocoding API (optional, for advanced features)

## Optional Environment Variables

```bash
# Flask Backend URL (if different from default)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Backend Requirements

Your Flask backend should have these endpoints:

### POST /api/weather
```json
Request:
{
  "city": "London",
  "unit": "metric"  // or "imperial"
}

Response:
{
  "current": {
    "main": { "temp": 15, "humidity": 65, "pressure": 1013 },
    "weather": [{ "main": "Cloudy", "description": "overcast clouds" }],
    "wind": { "speed": 5.5, "deg": 230, "gust": 8.2 },
    "visibility": 10000,
    "sys": { "sunrise": 1699000000, "sunset": 1699050000 },
    "clouds": { "all": 75 }
  },
  "forecast": {
    "list": [
      {
        "dt": 1699003600,
        "main": { "temp": 16, "humidity": 70 },
        "weather": [{ "main": "Rainy" }],
        "wind": { "speed": 6.2 }
      }
      // ... more forecast entries
    ]
  }
}
```

### POST /api/weather/location
```json
Request:
{
  "latitude": 51.5074,
  "longitude": -0.1278
}

Response: Same as /api/weather
```

### POST /api/search-city
```json
Request:
{
  "query": "London"
}

Response:
[
  {
    "name": "London",
    "lat": 51.5074,
    "lng": -0.1278,
    "country": "GB"
  }
]
```

## System Requirements

- **Node.js**: 16.0.0 or higher
- **npm/pnpm**: Latest version
- **Python**: 3.8+ (for Flask backend)
- **Browser**: Modern browser with ES6 support

## Installation Steps

### 1. Clone and Install
```bash
git clone <repo>
cd weather-dashboard
pnpm install
```

### 2. Configure Environment
```bash
# Create .env.local file
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here" > .env.local
```

### 3. Start Flask Backend
```bash
# Make sure it runs on port 5000
python flask_app.py
```

### 4. Start Next.js Development Server
```bash
pnpm dev
```

### 5. Open in Browser
```
http://localhost:3000
```

## Troubleshooting

### "Maps not loading"
- ✓ Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set
- ✓ Verify Maps JavaScript API is enabled in Google Cloud
- ✓ Check browser console for errors
- ✓ Clear cache: `Ctrl+Shift+Delete`

### "Search not working"
- ✓ Verify Flask backend is running: `curl http://localhost:5000/api/weather`
- ✓ Check network tab in DevTools
- ✓ Ensure correct city name spelling

### "Animations are slow"
- ✓ Enable hardware acceleration in browser
- ✓ Check CPU usage
- ✓ Try disabling other extensions
- ✓ Update browser to latest version

### "Weather data not updating"
- ✓ Check Flask backend logs
- ✓ Verify OpenWeather API key in backend
- ✓ Try manual refresh (button in header)

## Performance Optimization

### For Production

```bash
# Build optimized version
pnpm run build

# Start production server
pnpm run start
```

### Cache Strategy
- Weather data: Cache for 30 minutes
- Map data: Browser cache
- Static assets: CDN cache

### Database Optimization
- Consider caching frequent city searches
- Optimize forecast data storage
- Index location coordinates

## Security Notes

- ✓ Never commit .env.local to version control
- ✓ Use NEXT_PUBLIC_ prefix only for public data
- ✓ Validate all user inputs on backend
- ✓ Use HTTPS in production
- ✓ Set API key restrictions in Google Cloud

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
docker build -t weather-dashboard .
docker run -p 3000:3000 -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx weather-dashboard
```

### Environment in Vercel Dashboard
1. Go to Project Settings → Environment Variables
2. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

## Support

- **Issues**: Check GitHub issues
- **Documentation**: See FEATURES.md
- **Backend Help**: Ensure Flask app is running correctly

---

Happy weather exploring! 🌤️
