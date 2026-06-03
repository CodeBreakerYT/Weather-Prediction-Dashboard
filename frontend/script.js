async function fetchWeather() {

    const city =
        document.getElementById("city").value;

    // Use relative path for Vercel deployment & vercel dev, otherwise fallback to local Flask port
    const apiBase = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? (window.location.port === "3000" || window.location.port === "5000" ? "" : "http://127.0.0.1:5000")
        : "";

    const response = await fetch(`${apiBase}/weather/${city}`);

    const data = await response.json();

    document.getElementById("weather").innerHTML = `
        <h2>${data.name}</h2>

        <p>
            Temperature:
            ${data.main.temp} °C
        </p>

        <p>
            Humidity:
            ${data.main.humidity}%
        </p>

        <p>
            Weather:
            ${data.weather[0].description}
        </p>
    `;
}