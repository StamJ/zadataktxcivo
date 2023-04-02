FROM golang:latest AS builder
COPY hello-app.go .
RUN  go env -w CGO_ENABLED=0 GO111MODULE=off && go build -o /app/hello-app

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/hello-app .

RUN addgroup -g 1001 drugi && \
    adduser -S -u 1001 -G drugi drugi
RUN chown -R drugi:drugi /app && \
    chmod 755 /app
    
USER drugi

EXPOSE 11000

CMD ["./hello-app"]



