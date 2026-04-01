const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const errorBox = document.querySelector(".error");
const errorText = document.querySelector(".error p");
const weatherBox = document.querySelector(".weather");

function showError(message) {
    errorText.textContent = message;
    errorBox.style.display = "block";
    weatherBox.style.display = "none";
}

async function fetchWeather(city) {
    try {
        const encodedCity = encodeURIComponent(city.trim());
        const response = await fetch(`/weather?city=${encodedCity}`);

        if (!response.ok) {
            let message = "City not found or weather data unavailable.";
            try {
                const errorPayload = await response.json();
                if (errorPayload.message) {
                    message = errorPayload.message;
                }
            } catch (jsonError) {
                // Keep default message when API doesn't return JSON error details.
            }
            showError(message);
            return;
        }

        const weather = await response.json();
        document.querySelector(".locationName").textContent = weather.locationName;
        document.querySelector(".temperature").textContent = `${Math.round(weather.temperature)}°C`;
        document.querySelector(".humidity").textContent = `${weather.humidity}%`;
        document.querySelector(".wind").textContent = `${Math.round(weather.wind_speed)} km/h`;
        document.querySelector(".weather-icon").src = weather.icon;
        weatherBox.style.display = "block";
        errorBox.style.display = "none";
    } catch (error) {
        showError("Unable to fetch weather data right now. Please try again.");
    }
}

function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError("Enter a city, province/state, or country.");
        return;
    }
    fetchWeather(city);
}

searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});
