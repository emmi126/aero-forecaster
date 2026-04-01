FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o aeroforecaster .

FROM alpine:3.21

WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/aeroforecaster /app/aeroforecaster
COPY --from=builder --chown=appuser:appgroup /app/static /app/static
RUN chmod 755 /app /app/aeroforecaster && chmod -R a+rX /app/static

EXPOSE 8080

USER appuser

CMD ["./aeroforecaster"]
