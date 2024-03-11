FROM node:latest as build-frontend
WORKDIR /app
COPY ./frontend .
RUN npm install
RUN npm run build

FROM golang:latest as build-backend
WORKDIR /app
COPY . .
COPY --from=build-frontend /app/dist /app/dist
RUN go build -o main
EXPOSE 8080
CMD ["./main"]