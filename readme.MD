# Customer Analysis App

A full-stack application for analyzing customer data, providing insights through a modern frontend and robust backend services.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend Services](#backend-services)
  - [Technologies Used](#technologies-used)
  - [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Database](#database)
  - [Setup & Run](#setup--run-backend)
- [Frontend](#frontend)
  - [Technologies Used](#technologies-used-1)
  - [Features](#features)
  - [Setup & Run](#setup--run-frontend)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Customer Analysis App enables businesses to upload, manage, and analyze customer data, visualize trends, and generate actionable insights.

---

## Architecture

- **Frontend:** React-based SPA
- **Backend:** RESTful API (Node.js/Express)
- **Database:** MongoDB
- **Blob Storage:** Azure Storage Account
- **Deployment:** Docker

---

## Backend Services

### Technologies Used

- Node.js with Express (or Python with FastAPI)
- PostgreSQL (or MongoDB)
- Docker for containerization

### API Endpoints

| Method | Endpoint                              | Description                              | Auth Required |
|--------|---------------------------------------|------------------------------------------|--------------|
| POST   | `/upload`                             | Upload sale data                         | No           |
| GET    | `/upload`                             | List all sale records                    | No           |
| GET    | `/upload/:id`                         | Load a sale record                       | No           |
| GET    | `/insights`                           | Get all data insights                    | No           |
| GET    | `/insights/:salesId`                  | Get data insights for a sale record      | No           |
| GET    | `/monitor`                            | Get all process logs                     | No           |
| GET    | `/monitor/service/:serviceName`       | Get all process logs for a service       | No           |



### Database

- Sales collection: stores sale records.
- Insights collection: stores data insights.
- ProcessLogs collection: stores system logs.

### Setup & Run (Backend)

```bash
# Clone repository
git clone https://github.com/your-org/Customer-Analysis-App.git
cd Customer-Analysis-App/backend

# Direct to a service, for example insights-service
cd insights-services

# Install dependencies
npm install

# Configure environment variables in `.env` and `.env.test` for test cases

# Run development server
node app.js
```

---

## Frontend

### Technologies Used

- React (with hooks)
- Redux (or Context API)
- Axios for API calls
- Material UI (or Bootstrap) for UI components

### Features

- User authentication (login/register)
- Customer data upload and management
- Data visualization (charts, tables)
- Insights dashboard

### Setup & Run (Frontend)

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables in `.env`

# Run development server
npm start
```

---

## Deployment

- Docker Compose for local development
- CI/CD pipeline for automated deployment

### Docker image build

```bash
docker-compose -f .\services.yaml up
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

This project is licensed under the MIT License.
