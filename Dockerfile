FROM golang:1.20

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o aeroforecaster .

EXPOSE 8080

ENV OPENWEATHERMAP_API_KEY=""

CMD ["./aeroforecaster"]
