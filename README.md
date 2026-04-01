# AeroForecaster

A weather app using Go and Docker. This app fetches weather data using the OpenWeatherMap API and displays it in a user-friendly web interface.

## Prerequisites
- Go 1.22+
- OpenWeatherMap API key
- Docker

## Setup
```bash
git clone https://github.com/emmi126/aeroforecaster.git
cd aeroforecaster
```

Create `.env`:
```env
OPENWEATHERMAP_API_KEY=your_real_api_key
```

## Run (Local)
```bash
go run .
```

## Run (Docker)
```bash
docker build -t aeroforecaster .
docker run --rm --env-file .env -p 8080:8080 aeroforecaster
```

Open `http://localhost:8080`

## Check
```bash
curl -i http://localhost:8080/healthz
curl -s "http://localhost:8080/weather?city=Toronto"
```

## Upcoming Features
- Local storage: save the last searched city
- Temperature unit conversion (toggle between Celsius and Fahrenheit)
- Additional weather metrics
- Multi-city display
- Weather alerts
- Light/dark theme toggling
