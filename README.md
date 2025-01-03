# AeroForecaster  

A weather app using Go and Docker. This app fetches weather data using the OpenWeatherMap API and displays it in a user-friendly web interface.  

### Setup Instructions  

1. Clone the repository: `git clone https://github.com/emmi126/aero-forecaster.git`
2. Obtain an API key from [OpenWeatherMap](https://openweathermap.org/api).  
2. In the `.env` file, replace `your_api_key_here` with your OpenWeatherMap API key.
3. Build the docker image: `docker build -t aeroforecaster .`
4. Run the docker container: `docker run --env-file .env -p 8080:8080 aeroforecaster`
5. In your browser, navigate to `http://localhost:8080`

### Upcoming Features

- Local storage: save the last searched city
- Temperature unit conversion (toggle between Celsius and Fahrenheit)
- Additional weather metrics
- Multi-city display
- Weather alerts
- Light/dark theme toggling
