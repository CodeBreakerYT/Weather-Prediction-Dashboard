// ==========================================================================
// WEATHER EXPLORER DASHBOARD LOGIC (UPGRADED ANIMATIONS & AUTOCOMPLETE)
// ==========================================================================

// --- State Variables ---
let currentCity = 'Chennai';
let tempUnit = 'C'; // 'C' or 'F'
let currentWeatherData = null;
let currentForecastData = null;
let expandedStat = null;
let map = null;
let mapMarker = null;
let mainTrendsChart = null;
let humidityMicroChart = null;

// Search Recommendations State
let searchSuggestionsList = [];
let highlightedSuggestionIndex = -1;
let debounceTimeout = null;

// Animation Intervals / Timers
let rainSplashInterval = null;
let stormLightningInterval = null;
let wispInterval = null;

// API Base detection (compatible with Vercel and local environment)
const apiBase = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? (window.location.port === "3000" || window.location.port === "5000" ? "" : "http://127.0.0.1:5000")
    : "";

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    initNotifications();
    initMap(13.0827, 80.2707); // Default Chennai Coordinates
    setupAutocomplete();
    detectUserLocation();
});

// --- Fetching API Data ---
async function refreshData() {
    await fetchWeatherData(currentCity);
}

async function fetchWeatherData(city) {
    showLoadingState(true);
    try {
        // Fetch Current Weather
        const weatherRes = await fetch(`${apiBase}/weather/${city}`);
        const weatherData = await weatherRes.json();
        
        if (weatherData.cod != 200 || !weatherData.main) {
            showAPIError(weatherData.message || "Failed to load weather data.");
            showLoadingState(false);
            return;
        }

        // Fetch Forecast
        const forecastRes = await fetch(`${apiBase}/weather/forecast/${city}`);
        const forecastData = await forecastRes.json();

        // Reverse geocode coordinate to resolve neighborhood/suburb detail
        try {
            const lat = weatherData.coord.lat;
            const lon = weatherData.coord.lon;
            const reverseRes = await fetch(`${apiBase}/weather/reverse/${lat}/${lon}`);
            if (reverseRes.ok) {
                const reverseData = await reverseRes.json();
                if (reverseData && reverseData.name) {
                    weatherData.custom_name = reverseData.name;
                    weatherData.display_address = reverseData.display_name;
                }
            }
        } catch (e) {
            console.warn("Reverse geocode failed, using defaults:", e);
        }

        currentWeatherData = weatherData;
        currentForecastData = forecastData;
        currentCity = weatherData.custom_name || weatherData.name;

        updateDashboard();
    } catch (err) {
        console.error("API error fetching city weather:", err);
        showAPIError("Could not connect to Flask API server.");
    } finally {
        showLoadingState(false);
    }
}

async function fetchWeatherByCoords(lat, lon, customName = null, displayAddress = null) {
    showLoadingState(true);
    try {
        const weatherRes = await fetch(`${apiBase}/weather/coords/current/${lat}/${lon}`);
        const weatherData = await weatherRes.json();

        if (weatherData.cod != 200 || !weatherData.main) {
            showAPIError(weatherData.message || "Failed to load coordinates weather.");
            showLoadingState(false);
            return;
        }

        const forecastRes = await fetch(`${apiBase}/weather/coords/forecast/${lat}/${lon}`);
        const forecastData = await forecastRes.json();

        // Use passed geocoding info or fetch from backend reverse geocode endpoint
        if (customName && displayAddress) {
            weatherData.custom_name = customName;
            weatherData.display_address = displayAddress;
        } else {
            try {
                const reverseRes = await fetch(`${apiBase}/weather/reverse/${lat}/${lon}`);
                if (reverseRes.ok) {
                    const reverseData = await reverseRes.json();
                    if (reverseData && reverseData.name) {
                        weatherData.custom_name = reverseData.name;
                        weatherData.display_address = reverseData.display_name;
                    }
                }
            } catch (e) {
                console.warn("Reverse geocode failed, using defaults:", e);
            }
        }

        currentWeatherData = weatherData;
        currentForecastData = forecastData;
        currentCity = weatherData.custom_name || weatherData.name;

        updateDashboard();
    } catch (err) {
        console.error("API error fetching coord weather:", err);
        showAPIError("Could not connect to Flask API server.");
    } finally {
        showLoadingState(false);
    }
}

// --- Autocomplete Recommendations Setup ---
function setupAutocomplete() {
    const input = document.getElementById('city-input');
    const suggestionsBox = document.getElementById('search-suggestions');

    // Key up listener with debouncing
    input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        
        clearTimeout(debounceTimeout);
        if (val.length < 2) {
            hideSuggestions();
            return;
        }

        debounceTimeout = setTimeout(() => {
            fetchSearchRecommendations(val);
        }, 250);
    });

    // Keyboard controls navigation
    input.addEventListener('keydown', (e) => {
        const items = suggestionsBox.getElementsByClassName('suggestion-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedSuggestionIndex = (highlightedSuggestionIndex + 1) % items.length;
            updateHighlightedSuggestion(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedSuggestionIndex = (highlightedSuggestionIndex - 1 + items.length) % items.length;
            updateHighlightedSuggestion(items);
        } else if (e.key === 'Enter') {
            if (highlightedSuggestionIndex > -1) {
                e.preventDefault();
                selectSuggestion(highlightedSuggestionIndex);
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Close when clicking outside search bar
    document.addEventListener('click', (e) => {
        const container = document.querySelector('.search-wrapper');
        if (container && !container.contains(e.target)) {
            hideSuggestions();
        }
    });
}

async function fetchSearchRecommendations(query) {
    try {
        const res = await fetch(`${apiBase}/weather/search/${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
            searchSuggestionsList = data;
            renderSuggestions(data);
        } else {
            hideSuggestions();
        }
    } catch (e) {
        console.error("Error fetching geocoding autocomplete:", e);
        hideSuggestions();
    }
}

function renderSuggestions(suggestions) {
    const box = document.getElementById('search-suggestions');
    box.innerHTML = '';
    highlightedSuggestionIndex = -1;

    suggestions.forEach((item, index) => {
        const stateStr = item.state ? `${item.state}, ` : '';
        const nameFormatted = `${item.name}, ${stateStr}${item.country}`;
        
        const el = document.createElement('div');
        el.className = 'suggestion-item';
        el.innerText = nameFormatted;
        el.setAttribute('data-index', index);
        
        el.addEventListener('click', () => {
            selectSuggestion(index);
        });

        box.appendChild(el);
    });

    box.classList.add('active');
}

function updateHighlightedSuggestion(items) {
    for (let i = 0; i < items.length; i++) {
        if (i === highlightedSuggestionIndex) {
            items[i].classList.add('active');
            // Scroll to view
            items[i].scrollIntoView({ block: 'nearest' });
        } else {
            items[i].classList.remove('active');
        }
    }
}

function selectSuggestion(index) {
    const selected = searchSuggestionsList[index];
    if (selected) {
        document.getElementById('city-input').value = selected.name;
        hideSuggestions();
        fetchWeatherByCoords(selected.lat, selected.lon, selected.name, selected.display_name);
    }
}

function hideSuggestions() {
    const box = document.getElementById('search-suggestions');
    box.classList.remove('active');
    box.innerHTML = '';
    searchSuggestionsList = [];
    highlightedSuggestionIndex = -1;
}

// --- Main UI Bindings ---
function updateDashboard() {
    if (!currentWeatherData) return;
    
    // 1. Update text displays
    const cityName = currentWeatherData.custom_name || currentWeatherData.name;
    const country = currentWeatherData.sys.country || '';
    document.getElementById('city-display').innerText = `${cityName}, ${country}`;
    
    const addressEl = document.getElementById('address-display');
    if (addressEl) {
        if (currentWeatherData.display_address) {
            addressEl.innerText = currentWeatherData.display_address;
            addressEl.style.display = 'inline-block';
        } else {
            addressEl.style.display = 'none';
        }
    }

    document.getElementById('date-display').innerText = formatTimestamp(currentWeatherData.dt, 'full');
    
    const tempCelsius = currentWeatherData.main.temp;
    const feelsCelsius = currentWeatherData.main.feels_like;
    
    document.getElementById('temp-display').innerText = `${convertTemp(tempCelsius)}°`;
    document.getElementById('condition-display').innerText = currentWeatherData.weather[0].description;
    document.getElementById('feels-like-display').innerText = `${convertTemp(feelsCelsius)}°`;
    
    document.getElementById('sunrise-display').innerText = formatTimestamp(currentWeatherData.sys.sunrise, 'time');
    document.getElementById('sunset-display').innerText = formatTimestamp(currentWeatherData.sys.sunset, 'time');
    
    // 2. Update Map Marker
    const lat = currentWeatherData.coord.lat;
    const lon = currentWeatherData.coord.lon;
    updateMapMarker(lat, lon, cityName, tempCelsius);

    // 3. Update dynamic atmospheric animation stage
    updateWeatherAnimation(currentWeatherData);

    // 4. Update basic weather SVG icon
    updateWeatherIconBadge(currentWeatherData.weather[0].main);

    // 5. Update Diagnostics (6 cards)
    updateInteractiveStats();

    // 6. Update Forecast Cards
    updateForecastList();

    // 7. Update Analytics Chart (Chart.js)
    updateAnalyticsChart();

    // 8. Generate weather notifications/alerts
    checkNotifications(currentWeatherData);

    // Re-initialize Lucide icons
    lucide.createIcons();
}

// --- Interactive Weather Simulation Stage (Enhanced Animations) ---
function updateWeatherAnimation(data) {
    const condition = data.weather[0].main.toLowerCase();
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind ? data.wind.speed : 0;
    
    const viewport = document.getElementById('animation-viewport');
    const skyBack = document.getElementById('sky-back');
    const cloudLayer = document.getElementById('cloud-layer');
    const particlesContainer = document.getElementById('weather-particles');
    
    // Clean up previous animation loops
    clearInterval(rainSplashInterval);
    clearInterval(stormLightningInterval);
    clearInterval(wispInterval);
    viewport.classList.remove('lightning-strike');
    
    // Reset classes and elements
    skyBack.className = 'sky-background';
    particlesContainer.innerHTML = '';
    cloudLayer.innerHTML = '';
    
    // Remove old lightning elements
    const oldLightnings = viewport.querySelectorAll('.lightning-bolt');
    oldLightnings.forEach(el => el.remove());

    // Determine condition category
    let type = 'cloudy';
    if (condition.includes('clear') || condition.includes('sun')) type = 'sunny';
    else if (condition.includes('rain') || condition.includes('drizzle')) type = 'rainy';
    else if (condition.includes('snow')) type = 'snowy';
    else if (condition.includes('thunder') || condition.includes('storm')) type = 'stormy';
    
    skyBack.classList.add(`sky-${type}`);
    
    // 1. GENERATE DYNAMIC PARTICLES (RAIN/SNOW/WISPS)
    if (type === 'rainy' || type === 'stormy') {
        const count = type === 'stormy' ? 32 : 18;
        // Generate continuous angled rain drops
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = `${Math.random() * 110 - 10}%`; // account for angle drift
            drop.style.top = `${Math.random() * -30}%`;
            drop.style.animationDelay = `${Math.random() * 0.8}s`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.4}s`;
            particlesContainer.appendChild(drop);
        }

        // Generate rain splash ripples at bottom floor
        rainSplashInterval = setInterval(() => {
            createRainSplash(particlesContainer);
        }, 120);
    } else if (type === 'snowy') {
        // Generate floating swaying snowflakes
        for (let i = 0; i < 18; i++) {
            const flake = document.createElement('div');
            flake.className = 'flake';
            
            // Random sizes for parallax depth
            const size = 3 + Math.random() * 5;
            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;
            
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.top = `${Math.random() * -15}%`;
            flake.style.animationDelay = `${Math.random() * 4}s`;
            flake.style.animationDuration = `${4 + Math.random() * 3}s`;
            
            if (size < 5) {
                flake.style.filter = 'blur(1px)'; // blurred background flake
                flake.style.opacity = '0.5';
            }
            
            particlesContainer.appendChild(flake);
        }
    }

    // 2. PARALLAX DRIFTING CLOUDS (DEPTH LAYERING)
    if (type !== 'sunny') {
        const cloudCount = type === 'cloudy' ? 5 : type === 'stormy' ? 6 : 4;
        const speedClasses = ['cloud-front', 'cloud-mid', 'cloud-back'];
        
        for (let i = 0; i < cloudCount; i++) {
            const cloud = document.createElement('div');
            // Distribute clouds across back, mid, and front depth layers
            const depth = i % 3;
            cloud.className = `cloud-particle ${speedClasses[depth]}`;
            
            // Random styling to avoid uniformity
            cloud.style.top = `${15 + Math.random() * 80}px`;
            cloud.style.left = `${Math.random() * -120 - 40}px`; // start off-screen left
            cloud.style.animationDelay = `${Math.random() * 25}s`;
            
            // Adjust scaling slightly
            const scale = 0.8 + Math.random() * 0.5;
            cloud.style.transform = `scale(${scale})`;
            
            cloudLayer.appendChild(cloud);
        }
    }

    // 3. THUNDERSTORM LIGHTNING FORKS & CAMERA SHAKE
    if (type === 'stormy') {
        // Trigger randomized double-lightning strikes and viewport shakes
        stormLightningInterval = setInterval(() => {
            triggerLightningStrike(viewport, skyBack);
        }, 5500 + Math.random() * 5000); // strike every 5.5 to 10 seconds
    }

    // 4. HIGH WIND BLOWING WISPS
    if (windSpeed > 5 || type === 'stormy') {
        // Add horizontal blowing wisps
        wispInterval = setInterval(() => {
            createWindWisp(particlesContainer);
        }, 800);
    }
    
    // Text overlays binding
    document.getElementById('stage-temp-overlay').innerText = `${convertTemp(temp)}°`;
    document.getElementById('stage-cond-overlay').innerText = data.weather[0].description;
    document.getElementById('stage-humidity-overlay').innerText = humidity;

    // Ambient background overlay filters
    updateAmbientOverlay(type);
}

// Micro animation helpers
function createRainSplash(container) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    // Random position at bottom of viewport
    splash.style.left = `${Math.random() * 96 + 2}%`;
    splash.style.bottom = `${Math.random() * 6}px`;
    container.appendChild(splash);

    setTimeout(() => {
        splash.remove();
    }, 500);
}

function createWindWisp(container) {
    const wisp = document.createElement('div');
    wisp.className = 'wind-wisp';
    wisp.style.top = `${20 + Math.random() * 65}%`;
    wisp.style.width = `${80 + Math.random() * 120}px`;
    wisp.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
    container.appendChild(wisp);

    setTimeout(() => {
        wisp.remove();
    }, 3000);
}

function triggerLightningStrike(viewport, sky) {
    // 1. Trigger background double-flash in CSS
    sky.classList.add('lightning-flash');
    viewport.classList.add('lightning-strike');

    // 2. Generate SVG lightning fork element
    const bolt = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    bolt.setAttribute('class', 'lightning-bolt active');
    bolt.setAttribute('viewBox', '0 0 40 120');
    // Align randomly in the center 60% of viewport
    bolt.style.left = `${20 + Math.random() * 60}%`;
    
    // fork path details
    bolt.innerHTML = '<polygon points="20,0 26,45 38,45 18,120 15,65 2,65" fill="#fef08a" />';
    viewport.appendChild(bolt);

    // Clean strike classes and elements
    setTimeout(() => {
        sky.classList.remove('lightning-flash');
        viewport.classList.remove('lightning-strike');
        bolt.remove();
    }, 450);
}

function updateAmbientOverlay(type) {
    const overlay = document.getElementById('ambient-overlay');
    switch(type) {
        case 'sunny':
            overlay.style.background = 'radial-gradient(circle at 30% 20%, #eab308 0%, transparent 40%), radial-gradient(circle at 80% 70%, #f97316 0%, transparent 50%)';
            break;
        case 'rainy':
            overlay.style.background = 'radial-gradient(circle at 30% 20%, #0284c7 0%, transparent 40%), radial-gradient(circle at 80% 70%, #1e40af 0%, transparent 50%)';
            break;
        case 'stormy':
            overlay.style.background = 'radial-gradient(circle at 30% 20%, #6d28d9 0%, transparent 45%), radial-gradient(circle at 80% 70%, #db2777 0%, transparent 45%)';
            break;
        case 'snowy':
            overlay.style.background = 'radial-gradient(circle at 30% 20%, #0891b2 0%, transparent 40%), radial-gradient(circle at 80% 70%, #2563eb 0%, transparent 50%)';
            break;
        default: // cloudy / other
            overlay.style.background = 'radial-gradient(circle at 30% 20%, #475569 0%, transparent 40%), radial-gradient(circle at 80% 70%, #1e293b 0%, transparent 50%)';
    }
}

function updateWeatherIconBadge(mainCondition) {
    const container = document.getElementById('weather-badge-container');
    const cond = mainCondition.toLowerCase();
    
    let iconName = 'cloud';
    if (cond.includes('clear') || cond.includes('sun')) iconName = 'sun';
    else if (cond.includes('rain') || cond.includes('drizzle')) iconName = 'cloud-rain';
    else if (cond.includes('snow')) iconName = 'cloud-snow';
    else if (cond.includes('thunder')) iconName = 'zap';
    
    container.innerHTML = `<i data-lucide="${iconName}"></i>`;
}

// --- Interactive Atmospheric Diagnostics (Stats Grid) ---
function updateInteractiveStats() {
    if (!currentWeatherData) return;
    
    const main = currentWeatherData.main;
    const wind = currentWeatherData.wind || { speed: 0, deg: 0, gust: 0 };
    const vis = currentWeatherData.visibility || 0;
    const clouds = currentWeatherData.clouds || { all: 0 };
    
    // Core metrics
    document.getElementById('stat-val-humidity').innerText = `${main.humidity}%`;
    document.getElementById('stat-val-wind').innerText = `${Math.round(wind.speed)} m/s`;
    document.getElementById('stat-val-visibility').innerText = `${(vis / 1000).toFixed(1)} km`;
    document.getElementById('stat-val-pressure').innerText = `${main.pressure} mb`;
    document.getElementById('stat-val-clouds').innerText = `${clouds.all}%`;
    document.getElementById('stat-val-feelslike').innerText = `${convertTemp(main.feels_like)}°`;

    // 1. Humidity Details
    const hStatus = getHumidityComfortStatus(main.humidity);
    document.getElementById('badge-humidity').innerText = hStatus.label;
    document.getElementById('badge-humidity').className = `status-badge ${hStatus.class}`;
    document.getElementById('detail-val-dew').innerText = `${convertTemp(Math.round(main.feels_like - (100 - main.humidity) / 5))}°`;
    document.getElementById('detail-val-comfort').innerText = hStatus.comfort;
    document.getElementById('detail-humid-desc').innerText = `${main.humidity}%`;

    // 2. Wind Details
    const wLevel = getWindLevelStatus(wind.speed);
    document.getElementById('badge-wind').innerText = wLevel.label;
    document.getElementById('badge-wind').className = `status-badge ${wLevel.class}`;
    document.getElementById('detail-val-gust').innerText = `${Math.round(wind.gust || wind.speed * 1.2)} m/s`;
    const compassDeg = wind.deg || 0;
    const compassDir = getCompassDirection(compassDeg);
    document.getElementById('detail-val-deg').innerText = `${compassDeg}° (${compassDir})`;
    document.getElementById('detail-wind-dir').innerText = compassDir;
    document.getElementById('detail-wind-speed').innerText = Math.round(wind.speed);
    document.getElementById('compass-arrow').style.transform = `rotate(${compassDeg}deg)`;

    // 3. Visibility Details
    const vStatus = vis >= 10000 ? { label: 'Excellent', clear: 'Excellent', fog: 'None', class: 'cyan' } :
                    vis >= 5000 ? { label: 'Good', clear: 'Moderate', fog: 'Light haze', class: 'indigo' } :
                                  { label: 'Foggy', clear: 'Poor', fog: 'Fog warning active', class: 'pink' };
    document.getElementById('badge-visibility').innerText = vStatus.label;
    document.getElementById('badge-visibility').className = `status-badge ${vStatus.class}`;
    document.getElementById('detail-val-clarity').innerText = vStatus.clear;
    document.getElementById('detail-val-fog').innerText = vStatus.fog;
    document.getElementById('detail-vis-val').innerText = (vis / 1000).toFixed(1);

    // 4. Pressure Details
    const pTrend = main.pressure > 1013 ? { label: 'High Pressure', trend: 'Rising', rating: 'Stable', class: 'yellow' } :
                                          { label: 'Low Pressure', trend: 'Falling', rating: 'Unstable', class: 'pink' };
    document.getElementById('badge-pressure').innerText = pTrend.label;
    document.getElementById('badge-pressure').className = `status-badge ${pTrend.class}`;
    document.getElementById('detail-val-trend').innerText = pTrend.trend;
    document.getElementById('detail-val-stability').innerText = pTrend.rating;
    document.getElementById('detail-press-val').innerText = main.pressure;

    // 5. Cloud Cover Details
    const cStatus = clouds.all < 20 ? { label: 'Clear Sky', sky: 'Clear', stargaze: 'Perfect', class: 'cyan' } :
                    clouds.all < 60 ? { label: 'Partly Cloudy', sky: 'Scattered', stargaze: 'Fair', class: 'indigo' } :
                                      { label: 'Overcast', sky: 'Heavy', stargaze: 'Poor', class: 'pink' };
    document.getElementById('badge-clouds').innerText = cStatus.label;
    document.getElementById('badge-clouds').className = `status-badge ${cStatus.class}`;
    document.getElementById('detail-val-sky').innerText = cStatus.sky;
    document.getElementById('detail-val-stars').innerText = cStatus.stargaze;
    document.getElementById('detail-cloud-val').innerText = clouds.all;

    // 6. Feels Like Details
    const variance = Math.round(main.feels_like - main.temp);
    const feelBadge = variance > 1 ? { label: 'Humid Heat', class: 'pink' } :
                      variance < -1 ? { label: 'Wind Chill', class: 'cyan' } :
                                      { label: 'Neutral', class: 'indigo' };
    document.getElementById('badge-feelslike').innerText = feelBadge.label;
    document.getElementById('badge-feelslike').className = `status-badge ${feelBadge.class}`;
    document.getElementById('detail-val-actual').innerText = `${convertTemp(Math.round(main.temp))}°`;
    document.getElementById('detail-val-variance').innerText = `${variance > 0 ? '+' : ''}${convertTemp(variance)}°`;
    document.getElementById('detail-feel-val').innerText = `${convertTemp(Math.round(main.feels_like))}°`;

    // Redraw micro chart if currently expanded
    if (expandedStat === 'humidity') {
        drawHumidityMicroChart();
    }
}

function toggleStatExpand(statId) {
    const grid = document.getElementById('stats-grid');
    const items = grid.getElementsByClassName('stat-item');
    
    // Find target
    let targetItem = null;
    for (let item of items) {
        if (item.getAttribute('onclick').includes(statId)) {
            targetItem = item;
            break;
        }
    }
    
    if (!targetItem) return;
    
    const isCurrentlyActive = targetItem.classList.contains('active');
    
    // Collapse all items
    for (let item of items) {
        item.classList.remove('active');
    }
    
    if (!isCurrentlyActive) {
        targetItem.classList.add('active');
        expandedStat = statId;
        
        // Specially load the humidity microchart if opened
        if (statId === 'humidity') {
            setTimeout(drawHumidityMicroChart, 150); // slight timeout for CSS expansion transition
        }
    } else {
        expandedStat = null;
    }
}

function drawHumidityMicroChart() {
    const ctx = document.getElementById('humidity-micro-chart').getContext('2d');
    if (humidityMicroChart) {
        humidityMicroChart.destroy();
    }

    if (!currentForecastData || !currentForecastData.list) return;

    // Take next 8 data points (24 hours)
    const nextPoints = currentForecastData.list.slice(0, 8);
    const labels = nextPoints.map(p => formatTimestamp(p.dt, 'hour'));
    const dataset = nextPoints.map(p => p.main.humidity);

    humidityMicroChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity %',
                data: dataset,
                borderColor: '#00d9ff',
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                fill: true,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#00d9ff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(12, 16, 42, 0.95)',
                    titleColor: '#00d9ff',
                    bodyColor: '#e0f7ff',
                    borderColor: 'rgba(0, 217, 255, 0.3)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#8b94b8', font: { size: 10 } }
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#8b94b8', font: { size: 10 } }
                }
            }
        }
    });
}

// Helper diagnostics calculators
function getHumidityComfortStatus(h) {
    if (h < 35) return { label: 'Dry', comfort: 'Aggressive Dryness', class: 'yellow' };
    if (h < 65) return { label: 'Comfortable', comfort: 'Optimal', class: 'cyan' };
    if (h < 85) return { label: 'Humid Sticky', comfort: 'Moderately Damp', class: 'indigo' };
    return { label: 'Very Humid', comfort: 'Heavy Dampness', class: 'pink' };
}

function getWindLevelStatus(speed) {
    if (speed < 3) return { label: 'Calm', class: 'cyan' };
    if (speed < 8) return { label: 'Breeze', class: 'indigo' };
    if (speed < 15) return { label: 'Moderate Wind', class: 'yellow' };
    return { label: 'Gale Warning', class: 'pink' };
}

function getCompassDirection(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(((deg % 360) / 45)) % 8;
    return dirs[idx];
}

// --- 5-Day Horizons Forecast ---
function updateForecastList() {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';
    
    if (!currentForecastData || !currentForecastData.list) {
        container.innerHTML = '<div class="forecast-skeleton">No forecast available.</div>';
        return;
    }

    // Group the 3-hour forecast items by day for high/low temperatures accuracy
    const daysGroup = {};
    currentForecastData.list.forEach(item => {
        const dateObj = new Date(item.dt * 1000);
        const dateKey = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        if (!daysGroup[dateKey]) {
            daysGroup[dateKey] = [];
        }
        daysGroup[dateKey].push(item);
    });

    const dailyForecasts = [];
    Object.keys(daysGroup).forEach(dateKey => {
        const slots = daysGroup[dateKey];
        let tempMax = -999;
        let tempMin = 999;
        let totalPop = 0;

        slots.forEach(slot => {
            if (slot.main.temp_max > tempMax) tempMax = slot.main.temp_max;
            if (slot.main.temp_min < tempMin) tempMin = slot.main.temp_min;
            totalPop += (slot.pop || 0);
        });

        const avgPop = totalPop / slots.length;
        // Use afternoon slot as representative slot for weather description
        const representativeSlot = slots[Math.floor(slots.length / 2)];

        dailyForecasts.push({
            dt: representativeSlot.dt,
            weather: representativeSlot.weather,
            tempMax: tempMax,
            tempMin: tempMin,
            pop: avgPop
        });
    });

    // Take the first 5 aggregated days
    const finalDays = dailyForecasts.slice(0, 5);

    finalDays.forEach(day => {
        const dateObj = new Date(day.dt * 1000);
        const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const cond = day.weather[0].main.toLowerCase();
        let iconName = 'cloud';
        if (cond.includes('clear') || cond.includes('sun')) iconName = 'sun';
        else if (cond.includes('rain') || cond.includes('drizzle')) iconName = 'cloud-rain';
        else if (cond.includes('snow')) iconName = 'cloud-snow';
        else if (cond.includes('thunder')) iconName = 'zap';
        
        const rainChance = Math.round(day.pop * 100);

        const card = document.createElement('div');
        card.className = 'forecast-item';
        card.setAttribute('onclick', `searchPopularCity('${currentCity}')`);
        card.innerHTML = `
            <div class="forecast-day">${dayLabel}</div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: -6px;">${dateLabel}</div>
            <div class="forecast-icon-wrapper">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="forecast-desc">${day.weather[0].description}</div>
            <div class="forecast-temp-box">
                <span class="forecast-high">${convertTemp(day.tempMax)}°</span>
                <span class="forecast-low">${convertTemp(day.tempMin)}°</span>
            </div>
            <div class="forecast-rain">
                <div class="forecast-rain-lbl">
                    <span>Precip.</span>
                    <span>${rainChance}%</span>
                </div>
                <div class="rain-bar-bg">
                    <div class="rain-bar-fill" style="width: ${rainChance}%"></div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Comprehensive Trend Charts (Chart.js) ---
function updateAnalyticsChart() {
    const ctx = document.getElementById('weather-trends-chart').getContext('2d');
    
    if (mainTrendsChart) {
        mainTrendsChart.destroy();
    }
    
    if (!currentForecastData || !currentForecastData.list) return;

    // Fetch 12 readings (covers 36 hours of forecasts)
    const points = currentForecastData.list.slice(0, 12);
    const labels = points.map(p => formatTimestamp(p.dt, 'time-short'));
    const tempDataset = points.map(p => convertTemp(Math.round(p.main.temp)));
    const humidDataset = points.map(p => p.main.humidity);

    mainTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Temperature (${tempUnit === 'C' ? '°C' : '°F'})`,
                    data: tempDataset,
                    borderColor: '#00d9ff',
                    backgroundColor: 'rgba(0, 217, 255, 0.05)',
                    borderWidth: 3,
                    tension: 0.3,
                    yAxisID: 'y-temp',
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: '#00d9ff'
                },
                {
                    label: 'Humidity (%)',
                    data: humidDataset,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y-humid',
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: '#6366f1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#e0f7ff', font: { family: 'Outfit', size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(12, 16, 42, 0.95)',
                    titleColor: '#00d9ff',
                    bodyColor: '#e0f7ff',
                    borderColor: 'rgba(0, 217, 255, 0.3)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: { color: '#8b94b8', font: { family: 'Outfit' } }
                },
                'y-temp': {
                    type: 'linear',
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#00d9ff', font: { family: 'Outfit' } }
                },
                'y-humid': {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#6366f1', font: { family: 'Outfit' } },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// --- Interactive Leaflet Map ---
function initMap(lat, lon) {
    // Destroy previous Leaflet map instance if it exists
    if (map) {
        map.remove();
        map = null;
    }
    
    map = L.map('weather-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([lat, lon], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Map Click Trigger
    map.on('click', (e) => {
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;
        
        fetchWeatherByCoords(clickedLat, clickedLng);
    });

    updateMapMarker(lat, lon, "Chennai", 30);
}

function updateMapMarker(lat, lon, name, tempCelsius) {
    if (!map) return;
    
    if (mapMarker) {
        mapMarker.remove();
    }

    const popupHtml = `
        <div class="map-popup-card">
            <h4>${name}</h4>
            <p>Temp: ${convertTemp(Math.round(tempCelsius))}°${tempUnit}</p>
            <p style="font-size: 8px; color: var(--text-muted); font-family: var(--font-pixel);">CLICK MAP TO EXPLORE</p>
        </div>
    `;

    mapMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup(popupHtml)
        .openPopup();

    // Center map and zoom in to level 12 if zoomed out, showing local neighborhood detail
    map.setView([lat, lon], Math.max(map.getZoom(), 12));
    
    document.getElementById('map-footer-coords').innerText = `GPS Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

// --- GPS Geolocation Detection ---
function detectUserLocation() {
    showNotification("Detecting your current location...", "info");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByCoords(lat, lon);
            },
            (error) => {
                console.warn("Geolocation access failed:", error);
                showNotification("Could not detect location. Loading Chennai weather.", "info");
                refreshData();
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
        );
    } else {
        refreshData();
    }
}

// --- Map Custom Themes and Fullscreen ---
let isMapDarkTheme = true;

function toggleMapTheme() {
    const mapContainer = document.getElementById('weather-map');
    const themeBtn = document.getElementById('btn-map-theme');
    
    isMapDarkTheme = !isMapDarkTheme;
    
    if (isMapDarkTheme) {
        mapContainer.classList.remove('map-light-theme');
        themeBtn.innerHTML = '<i data-lucide="eye-off"></i>';
        themeBtn.setAttribute('title', 'Switch to Light Theme');
    } else {
        mapContainer.classList.add('map-light-theme');
        themeBtn.innerHTML = '<i data-lucide="eye"></i>';
        themeBtn.setAttribute('title', 'Switch to Cyber Dark Theme');
    }
    
    lucide.createIcons();
}

function toggleMapFullscreen() {
    const mapCard = document.getElementById('map-card-container');
    const expandBtn = document.getElementById('btn-map-expand');
    
    const isFullscreen = mapCard.classList.toggle('fullscreen-map');
    
    if (isFullscreen) {
        expandBtn.innerHTML = '<i data-lucide="minimize-2"></i>';
    } else {
        expandBtn.innerHTML = '<i data-lucide="maximize-2"></i>';
    }
    
    // Invalidate Leaflet Map bounds to trigger resizing and fit container
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 450); // wait for CSS transform transition
    
    lucide.createIcons();
}

// --- Dynamic Search Handlers ---
function handleSearchKey(event) {
    if (event.key === 'Enter') {
        // Only trigger search if suggestions are not active/highlighted
        if (highlightedSuggestionIndex === -1) {
            triggerSearch();
        }
    }
}

function triggerSearch() {
    const val = document.getElementById('city-input').value.trim();
    if (val) {
        // Use top suggestion if suggestions list is populated to enable precise coordinate search
        if (searchSuggestionsList && searchSuggestionsList.length > 0) {
            selectSuggestion(0);
        } else {
            fetchWeatherData(val);
        }
        document.getElementById('city-input').value = '';
        hideSuggestions();
    }
}

function searchPopularCity(city) {
    // Highlight City tag
    const tags = document.querySelectorAll('.city-tag');
    tags.forEach(tag => {
        if (tag.innerText.toLowerCase() === city.toLowerCase()) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });

    fetchWeatherData(city);
    hideSuggestions();
}

// --- Temperature Scale Converter ---
function setUnit(unit) {
    if (tempUnit === unit) return;
    tempUnit = unit;
    
    // Toggle active state on buttons
    document.getElementById('unit-c').classList.toggle('active', unit === 'C');
    document.getElementById('unit-f').classList.toggle('active', unit === 'F');

    updateDashboard();
}

function convertTemp(celsius) {
    if (tempUnit === 'C') {
        return Math.round(celsius);
    }
    return Math.round((celsius * 9) / 5 + 32);
}

// --- City Comparison Engine ---
async function compareCities() {
    const compareInput = document.getElementById('compare-city-input').value.trim();
    if (!compareInput) return;
    if (!currentWeatherData) return;

    try {
        const res = await fetch(`${apiBase}/weather/${compareInput}`);
        const data = await res.json();

        if (data.cod != 200 || !data.main) {
            alert("Comparison city not found.");
            return;
        }

        // Bind comparison elements
        document.getElementById('comp-city-primary').innerText = currentWeatherData.name;
        document.getElementById('comp-city-secondary').innerText = data.name;

        // Metric rows
        document.getElementById('comp-val-temp1').innerText = `${convertTemp(currentWeatherData.main.temp)}°${tempUnit}`;
        document.getElementById('comp-val-temp2').innerText = `${convertTemp(data.main.temp)}°${tempUnit}`;

        document.getElementById('comp-val-humid1').innerText = `${currentWeatherData.main.humidity}%`;
        document.getElementById('comp-val-humid2').innerText = `${data.main.humidity}%`;

        document.getElementById('comp-val-wind1').innerText = `${Math.round(currentWeatherData.wind.speed)} m/s`;
        document.getElementById('comp-val-wind2').innerText = `${Math.round(data.wind.speed)} m/s`;

        // Calculate overall habitability scores
        const score1 = calculateHabitabilityIndex(currentWeatherData);
        const score2 = calculateHabitabilityIndex(data);

        document.getElementById('comp-val-index1').innerText = `${score1}/10`;
        document.getElementById('comp-val-index2').innerText = `${score2}/10`;

        document.getElementById('compare-city-input').value = '';
    } catch (err) {
        console.error("Comparison search error:", err);
    }
}

function calculateHabitabilityIndex(weather) {
    let score = 10;
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const wind = weather.wind.speed;

    // Penalty for excessive temperature
    if (temp > 35 || temp < 5) score -= 3;
    else if (temp > 28 || temp < 15) score -= 1;

    // Penalty for humidity
    if (humidity > 80 || humidity < 25) score -= 2;

    // Penalty for wind
    if (wind > 12) score -= 2;

    return Math.max(score, 1);
}

// --- Notification Alert system ---
let activeNotifications = [];

function initNotifications() {
    activeNotifications = [
        { id: 1, type: 'info', text: 'Welcome to Weather Explorer! Ready to analyze atmospheric diagnostics?', time: 'Just now' }
    ];
    renderNotifications();
}

function toggleNotifications() {
    const el = document.getElementById('notification-dropdown');
    el.classList.toggle('active');
}

function showNotification(text, type = 'info') {
    const newAlert = {
        id: Date.now(),
        type: type,
        text: text,
        time: 'Just now'
    };
    activeNotifications.unshift(newAlert);
    
    // Pulse the bell indicator badge
    document.getElementById('btn-bell').classList.add('pulsing');
    
    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notification-badge');
    
    if (activeNotifications.length === 0) {
        list.innerHTML = '<div class="empty-notifications">No active warnings for today.</div>';
        badge.style.display = 'none';
        return;
    }

    badge.style.display = 'block';

    list.innerHTML = '';
    activeNotifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.type}`;
        item.innerHTML = `
            <div>
                <p>${notif.text}</p>
                <div class="time">${notif.time}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

function clearNotifications() {
    activeNotifications = [];
    document.getElementById('btn-bell').classList.remove('pulsing');
    renderNotifications();
}

function checkNotifications(data) {
    // Clear dynamic weather warnings, keep permanent ones
    activeNotifications = activeNotifications.filter(n => n.id === 1);
    
    const main = data.main;
    const wind = data.wind || { speed: 0 };
    
    // Wind warning
    if (wind.speed > 8) {
        showNotification(`🌬️ High Gale Warning in ${data.name}: Winds up to ${Math.round(wind.speed)} m/s detected.`, 'warning');
    }
    
    // Humidity warning
    if (main.humidity > 85) {
        showNotification(`💧 Intense moisture block in ${data.name}: Comfort level is extremely damp.`, 'warning');
    }

    // Sunrise alert
    const nowSecs = Date.now() / 1000;
    if (Math.abs(nowSecs - data.sys.sunset) < 3600) {
        showNotification(`🌇 Solar phase: Sunset occurring soon in ${data.name}.`, 'info');
    }
}

// --- Loading / Error Screen helpers ---
function showLoadingState(isLoading) {
    const refreshIcon = document.getElementById('icon-refresh');
    if (isLoading) {
        refreshIcon.style.animation = 'rotateCW 1s linear infinite';
    } else {
        refreshIcon.style.animation = 'none';
    }
}

function showAPIError(message) {
    showNotification(`⚠️ API Connection Error: ${message}`, 'warning');
}

// --- Formatting Helpers ---
function formatTimestamp(timestamp, formatType) {
    const date = new Date(timestamp * 1000);
    if (formatType === 'full') {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (formatType === 'time') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (formatType === 'time-short') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (formatType === 'hour') {
        return `${date.getHours()}:00`;
    }
    return date.toLocaleDateString();
}