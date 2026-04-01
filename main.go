package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/briandowns/openweathermap"
	"github.com/joho/godotenv"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Code    int    `json:"code"`
	Message string `json:"message"`
}

var apiKey string

func init() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Printf("No .env file loaded (%v). Continuing with process environment variables.", err)
	}

	// Read API key from the environment
	apiKey = os.Getenv("OPENWEATHERMAP_API_KEY")
	if apiKey == "" {
		log.Fatalf("API key is missing from environment variables")
	}
}

func sendError(w http.ResponseWriter, code int, message string) {
	response := ErrorResponse{
		Error:   http.StatusText(code),
		Code:    code,
		Message: message,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/healthz", healthCheck)
	http.HandleFunc("/weather", getWeather)

	port := ":8080"
	fmt.Printf("AeroForecaster is running at http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

func healthCheck(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./static/index.html")
}

func getWeather(w http.ResponseWriter, r *http.Request) {
	city := strings.TrimSpace(r.URL.Query().Get("city"))
	if city == "" {
		sendError(w, http.StatusBadRequest, "City parameter is required")
		return
	}

	weather, err := openweathermap.NewCurrent("C", "en", apiKey)
	if err != nil {
		sendError(w, http.StatusInternalServerError, "Failed to initialize weather client")
		return
	}

	err = weather.CurrentByName(city)
	if err != nil {
		sendError(w, http.StatusNotFound, "City not found or weather data unavailable")
		return
	}
	if len(weather.Weather) == 0 {
		sendError(w, http.StatusBadGateway, "Weather provider returned incomplete weather data")
		return
	}

	windSpeedKmh := weather.Wind.Speed * 3.6

	iconPath := getWeatherIcon(
		weather.Weather[0].ID,
		int64(weather.Dt),
		int64(weather.Sys.Sunrise),
		int64(weather.Sys.Sunset),
	)

	response := map[string]interface{}{
		"locationName": weather.Name,
		"temperature":  weather.Main.Temp,
		"humidity":     weather.Main.Humidity,
		"wind_speed":   windSpeedKmh,
		"description":  weather.Weather[0].Description,
		"icon":         iconPath,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getWeatherIcon(weatherID int, currentTime, sunriseTime, sunsetTime int64) string {
	isDay := currentTime >= sunriseTime && currentTime <= sunsetTime

	switch {
	case weatherID == 800:
		if isDay {
			return "/static/res/weather/day-clear.png"
		}
		return "/static/res/weather/night-clear.png"
	case weatherID >= 200 && weatherID <= 232:
		return "/static/res/weather/neutral-storm.png"
	case weatherID >= 300 && weatherID <= 321:
		return "/static/res/weather/neutral-rain.png"
	case weatherID >= 500 && weatherID <= 531:
		if isDay {
			return "/static/res/weather/day-rain.png"
		}
		return "/static/res/weather/night-rain.png"
	case weatherID >= 600 && weatherID <= 622:
		if isDay {
			return "/static/res/weather/day-snow.png"
		}
		return "/static/res/weather/night-snow.png"
	case weatherID >= 701 && weatherID <= 781:
		if isDay {
			return "/static/res/weather/day-fog.png"
		}
		return "/static/res/weather/night-fog.png"
	case weatherID >= 801 && weatherID <= 804:
		if isDay {
			return "/static/res/weather/day-cloud.png"
		}
		return "/static/res/weather/night-cloud.png"
	default:
		return "/static/res/weather/neutral-cloud.png"
	}
}
