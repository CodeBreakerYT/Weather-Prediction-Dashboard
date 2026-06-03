async function fetchWeather() {

    const city =
        document.getElementById("city").value;

    const response =
        await fetch(
            `http://127.0.0.1:5000/weather/${city}`
        );

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