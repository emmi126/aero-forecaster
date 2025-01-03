async function fetchWeather(city) {
    const response = await fetch(`/weather?city=${city}`);
    if (!response.ok) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        return;
    }

    const weather = await response.json();

    document.querySelector(".locationName").innerHTML = weather.locationName;
    document.querySelector(".temperature").innerHTML = Math.round(weather.temperature) + "°C";
    document.querySelector(".humidity").innerHTML = weather.humidity + "%";
    document.querySelector(".wind").innerHTML = weather.wind_speed + " km/h";
    document.querySelector(".weather-icon").src = weather.icon;
    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}

document.querySelector(".search button").addEventListener("click", () => {
    const city = document.querySelector(".search input").value;
    if (city) {
        fetchWeather(city);
    } else {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
});
