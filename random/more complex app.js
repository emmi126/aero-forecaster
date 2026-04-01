// DOM Elements
const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const weatherDisplay = document.querySelector(".weather");
const errorDisplay = document.querySelector(".error");

// Add loading spinner element
const loadingSpinner = document.createElement("div");
loadingSpinner.className = "loading";
loadingSpinner.innerHTML = "Loading...";
loadingSpinner.style.display = "none";
document.querySelector(".card").insertBefore(loadingSpinner, weatherDisplay);

// Initialize from localStorage if available
document.addEventListener("DOMContentLoaded", () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        searchInput.value = lastCity;
        fetchWeather(lastCity);
    }
});

async function fetchWeather(city) {
    try {
        // Show loading state
        weatherDisplay.style.display = "none";
        errorDisplay.style.display = "none";
        loadingSpinner.style.display = "block";

        const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch weather data');
        }

        updateWeatherUI(data);
        localStorage.setItem('lastCity', city);

    } catch (error) {
        showError(error.message);
    } finally {
        loadingSpinner.style.display = "none";
    }
}

function updateWeatherUI(weather) {
    // Update all weather information
    document.querySelector(".locationName").textContent = weather.locationName;
    document.querySelector(".temperature").textContent = `${Math.round(weather.temperature)}°C`;
    document.querySelector(".humidity").textContent = `${weather.humidity}%`;
    document.querySelector(".wind").textContent = `${weather.wind_speed} km/h`;
    
    // Update weather icon
    const weatherIcon = document.querySelector(".weather-icon");
    weatherIcon.src = weather.icon;
    weatherIcon.alt = weather.description;

    // Show weather display
    weatherDisplay.style.display = "block";
}

function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = "block";
    weatherDisplay.style.display = "none";
}

// Event Listeners
searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError("Please enter a city name");
    }
});

// Add keyboard support
searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            showError("Please enter a city name");
        }
    }
});

// Add geolocation support
if ("geolocation" in navigator) {
    const geoButton = document.createElement("button");
    geoButton.innerHTML = `<img src="/static/res/icons/location.png" alt="Use current location">`;
    geoButton.className = "geo-button";
    document.querySelector(".search").appendChild(geoButton);

    geoButton.addEventListener("click", () => {
        loadingSpinner.style.display = "block";
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`/weather?lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to fetch weather data');
                    }

                    updateWeatherUI(data);
                    searchInput.value = data.locationName;
                    localStorage.setItem('lastCity', data.locationName);
                } catch (error) {
                    showError(error.message);
                } finally {
                    loadingSpinner.style.display = "none";
                }
            },
            (error) => {
                showError("Unable to get your location. Please enter a city name.");
                loadingSpinner.style.display = "none";
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Add temperature unit conversion
let isCelsius = true;
const tempDisplay = document.querySelector(".temperature");

function createUnitToggle() {
    const unitToggle = document.createElement("button");
    unitToggle.className = "unit-toggle";
    unitToggle.textContent = "°C | °F";
    document.querySelector(".weather").insertBefore(unitToggle, document.querySelector(".details"));

    unitToggle.addEventListener("click", () => {
        const currentTemp = parseFloat(tempDisplay.textContent);
        if (isCelsius) {
            // Convert to Fahrenheit
            const fahrenheit = (currentTemp * 9/5) + 32;
            tempDisplay.textContent = `${Math.round(fahrenheit)}°F`;
        } else {
            // Convert to Celsius
            const celsius = (currentTemp - 32) * 5/9;
            tempDisplay.textContent = `${Math.round(celsius)}°C`;
        }
        isCelsius = !isCelsius;
    });
}

createUnitToggle();

// Add debouncing for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-complete cities (you'll need to add backend support for this)
const debouncedSearch = debounce(async (searchTerm) => {
    if (searchTerm.length < 3) return;
    
    try {
        const response = await fetch(`/cities?search=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
            const cities = await response.json();
            // Implementation for showing city suggestions would go here
        }
    } catch (error) {
        console.error('Failed to fetch city suggestions:', error);
    }
}, 300);

searchInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value.trim());
});