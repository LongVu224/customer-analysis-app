# Build stage
FROM node:20-alpine AS build

# Define build args and convert to ENV (React needs ENV vars during npm run build)
ARG REACT_APP_INSIGHTS_SERVICE_ENDPOINT
ARG REACT_APP_UPLOAD_SERVICE_ENDPOINT
ARG REACT_APP_MONITOR_SERVICE_ENDPOINT

ENV REACT_APP_INSIGHTS_SERVICE_ENDPOINT=$REACT_APP_INSIGHTS_SERVICE_ENDPOINT
ENV REACT_APP_UPLOAD_SERVICE_ENDPOINT=$REACT_APP_UPLOAD_SERVICE_ENDPOINT
ENV REACT_APP_MONITOR_SERVICE_ENDPOINT=$REACT_APP_MONITOR_SERVICE_ENDPOINT

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g serve

COPY --from=build /build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
