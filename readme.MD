# Finance Analysis App

A full-stack application for analyzing finance data, providing insights through a modern frontend and robust backend services. Deployed on **Azure Container Apps** with full CI/CD automation.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend Services](#backend-services)
  - [Technologies Used](#technologies-used)
  - [API Endpoints](#api-endpoints)
  - [Database](#database)
  - [Setup & Run](#setup--run-backend)
- [Frontend](#frontend)
  - [Technologies Used](#technologies-used-1)
  - [Features](#features)
  - [Setup & Run](#setup--run-frontend)
- [Infrastructure](#infrastructure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Finance Analysis App enables businesses to upload, manage, and analyze finance data, visualize trends, and generate actionable insights.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Azure Container Apps Environment                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Frontend (React)        → External ingress (public)        ││
│  │  https://<app>-frontend.<id>.azurecontainerapps.io          ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │ Upload Svc  │ │ Insights Svc│ │ Monitor Svc │ │Investment Svc││
│  │ :8000       │ │ :9000       │ │ :8999       │ │ :3004       ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
│  Docker Hub (docker.io/longvu224/*) ← Stores Docker images      │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Azure Storage   │  │ Azure Key Vault │  │ App Insights +  │
│ Account         │  │                 │  │ Log Analytics   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Components:**
- **Frontend:** React SPA served via Container App
- **Backend:** 4 Node.js microservices (upload, insights, monitor, investment)
- **Database:** MongoDB
- **Storage:** Azure Storage Account (using Azure Identity for authentication)
- **Registry:** Docker Hub (free tier)
- **Monitoring:** Azure Application Insights + Log Analytics
- **Secrets:** Azure Key Vault

---

## Backend Services

### Technologies Used

- Node.js with Express
- MongoDB
- Docker for containerization

### API Endpoints

| Method | Endpoint                              | Description                              | Auth Required |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/upload`                             | Upload sale data                         | Password      |
| GET    | `/upload`                             | List all sale records                    | No            |
| GET    | `/upload/:id`                         | Load a sale record                       | No            |
| GET    | `/insights`                           | Get all data insights                    | No            |
| GET    | `/insights/:salesId`                  | Get data insights for a sale record      | No            |
| GET    | `/monitor`                            | Get all process logs                     | No            |
| GET    | `/monitor/service/:serviceName`       | Get all process logs for a service       | No            |
| GET    | `/monitor/health`                     | Get health status of all services        | No            |
| GET    | `/stocks/trending`                    | Get trending stocks                      | No            |
| GET    | `/stocks/quote/:symbol`               | Get stock quote                          | No            |
| GET    | `/stocks/analysis/:symbol`            | Get stock analysis with indicators       | No            |
| GET    | `/stocks/market/:marketId`            | Get stocks for a market (us/finland)     | No            |
| GET    | `/stocks/watchlist`                   | Get user's watchlist                     | No            |
| POST   | `/stocks/watchlist/:symbol`           | Add stock to watchlist                   | No            |
| DELETE | `/stocks/watchlist/:symbol`           | Remove stock from watchlist              | No            |
| GET    | `/stocks/search/:query`               | Search for stocks                        | No            |



### Database

- **Sales** collection: stores sale records
- **Insights** collection: stores data insights
- **ProcessLogs** collection: stores system logs
- **Watchlist** collection: stores user's stock watchlist
- **StockData** collection: caches stock data
- **MarketCustomSymbols** collection: stores custom market symbols

### Setup & Run (Backend)

```powershell
# Clone repository
git clone https://github.com/LongVu224/finance-analysis.git
cd finance-analysis\backend

# Direct to a service, for example insights-service
cd insights-service

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
- SCSS for styling
- Axios for API calls
- Recharts for data visualization

### Features

- Sale data upload and management
- Data visualization (charts, tables)
- Insights dashboard with analytics
- **Investment Dashboard:**
  - Real-time stock quotes (US & Helsinki markets)
  - Stock analysis with technical indicators (RSI, SMA)
  - Investment suggestions based on technical analysis
  - Watchlist management
  - Price trend charts (60 days)
- System monitoring dashboard
- Service health checks

### Setup & Run (Frontend)

```powershell
cd ..\frontend

# Install dependencies
npm install

# Configure environment variables in `.env.development`

# Run development server
npm start
```

---

## Infrastructure

Infrastructure is managed as code using **Azure Bicep** templates.

### Bicep Modules

| Module | Description |
|--------|-------------|
| `main.bicep` | Main orchestration template |
| `container-apps.bicep` | Container Apps Environment + 5 apps |
| `storage-account.bicep` | Azure Storage Account |
| `key-vault.bicep` | Azure Key Vault |
| `monitoring.bicep` | App Insights + Log Analytics |

### Azure Resources Created

```
sale-analysis-rg/
├── sale-analysis-env        (Container Apps Environment)
│   ├── sale-analysis-frontend   (Frontend Container App)
│   ├── sale-analysis-upload     (Upload Service)
│   ├── sale-analysis-insights   (Insights Service)
│   ├── sale-analysis-monitor    (Monitor Service)
│   └── sale-analysis-investment (Investment Service)
├── sale-analysis-ai         (Application Insights)
├── sale-analysis-law        (Log Analytics Workspace)
├── saleanalysisstorage      (Storage Account)
└── sale-analysis-kv         (Key Vault)

Docker Hub (external):
└── docker.io/longvu224/         (Docker Hub repository)
    ├── upload-service
    ├── insights-service
    ├── monitor-service
    ├── investment-service
    └── frontend
```

---

## Deployment

### CI/CD Pipeline (Azure DevOps)

The pipeline (`infrastructure/pipeline.yaml`) automates the full deployment:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ ValidateInfra│ →  │ DeployInfra  │ →  │ BuildAndPush │ →  │ DeployApps   │
│              │    │              │    │              │    │              │
│ • Validate   │    │ • Manual     │    │ • Build all  │    │ • Update all │
│   Bicep      │    │   approval   │    │   Docker     │    │   Container  │
│ • What-If    │    │ • Deploy     │    │   images     │    │   Apps       │
│   preview    │    │   infra      │    │ • Push to    │    │              │
│              │    │              │    │   Docker Hub │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Prerequisites

1. **Azure DevOps Service Connection**: `sale-analysis-connection`
2. **Docker Hub Service Connection**: `docker-hub-connection` (Docker Registry type)
3. **Pipeline Secret Variable**: `dockerHubPassword` (Docker Hub Access Token)
4. **Resource Group**: `sale-analysis-rg` (create beforehand)
5. **Environment**: `sale-analysis` in Azure DevOps

### Deploy Infrastructure Manually

```powershell
# Login to Azure
az login

# Create resource group
az group create --name sale-analysis-rg --location northeurope

# Deploy Bicep templates (replace YOUR_DOCKER_HUB_TOKEN)
az deployment group create `
  --resource-group sale-analysis-rg `
  --template-file infrastructure/templates/main.bicep `
  --parameters infrastructure/templates/main.bicepparam `
  --parameters dockerHubPassword='YOUR_DOCKER_HUB_TOKEN'
```

### Build and Push Images Manually

```powershell
# Login to Docker Hub
docker login -u longvu224

# Build and push (from project root)
cd backend\upload-service; docker build -f .dockerfile -t longvu224/upload-service:latest .; docker push longvu224/upload-service:latest; cd ..\..  
cd backend\insights-service; docker build -f .dockerfile -t longvu224/insights-service:latest .; docker push longvu224/insights-service:latest; cd ..\..
cd backend\monitor-service; docker build -f .dockerfile -t longvu224/monitor-service:latest .; docker push longvu224/monitor-service:latest; cd ..\..
cd backend\investment-service; docker build -f .dockerfile -t longvu224/investment-service:latest .; docker push longvu224/investment-service:latest; cd ..\..
cd frontend; docker build -f .dockerfile -t longvu224/frontend:latest .; docker push longvu224/frontend:latest; cd ..

# Update Container Apps to use new images
az containerapp update --name sale-analysis-frontend --resource-group sale-analysis-rg --image "docker.io/longvu224/frontend:latest"
az containerapp update --name sale-analysis-upload --resource-group sale-analysis-rg --image "docker.io/longvu224/upload-service:latest"
az containerapp update --name sale-analysis-insights --resource-group sale-analysis-rg --image "docker.io/longvu224/insights-service:latest"
az containerapp update --name sale-analysis-monitor --resource-group sale-analysis-rg --image "docker.io/longvu224/monitor-service:latest"
az containerapp update --name sale-analysis-investment --resource-group sale-analysis-rg --image "docker.io/longvu224/investment-service:latest"
```

### Local Development with Docker

Run all services locally using Docker Compose:

```powershell
# Start all services (MongoDB + 3 backend services + frontend)
docker-compose up --build

# or run in development mode with hot reload (if configured)
docker-compose -f docker-compose.dev.yaml up

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

**Services available at:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Upload Service | http://localhost:8000 |
| Insights Service | http://localhost:9000 |
| Monitor Service | http://localhost:8999 |
| Investment Service | http://localhost:3004 |
| MongoDB | mongodb://localhost:27017 |

**Azure Storage Configuration:**

The application uses **Azure Identity** (`DefaultAzureCredential`) for storage authentication, which automatically works with:
- **Local development**: Your Azure CLI credentials (`az login`)
- **Production (Azure)**: The Container App's managed identity

Create a `.env` file in each backend service directory:
```powershell
# Required - Storage account name
STORAGE_NAME=your_storage_account_name

# Optional - If not provided, uses Azure Identity (recommended)
# STORAGE_KEY=your_storage_account_key
```

For local development, simply run:
```powershell
az login  # Sign in with your Azure account
```

For production, assign the **"Storage Blob Data Contributor"** role to your Container App's managed identity on the storage account.

### Environment Variables

#### Upload Service (`backend/upload-service/.env`)
```
STORAGE_NAME=your_storage_account_name
DB_CONNECTION_STRING=mongodb://localhost:27017/customer-analysis
UPLOAD_PASSWORD=your_secure_password
```

| Variable | Required | Description |
|----------|----------|-------------|
| `STORAGE_NAME` | Yes | Azure Storage Account name |
| `STORAGE_KEY` | No | Azure Storage Account key (optional - uses Azure Identity if not set) |
| `STORAGE_URL` | No | Override storage URL (defaults to `https://{STORAGE_NAME}.blob.core.windows.net`) |
| `DB_CONNECTION_STRING` | Yes | MongoDB connection string |
| `UPLOAD_PASSWORD` | No | Password for upload protection (if empty, uploads are unrestricted) |

#### Insights Service (`backend/insights-service/.env`)
```
STORAGE_NAME=your_storage_account_name
DB_CONNECTION_STRING=mongodb://localhost:27017/customer-analysis
```

| Variable | Required | Description |
|----------|----------|-------------|
| `STORAGE_NAME` | Yes | Azure Storage Account name |
| `STORAGE_KEY` | No | Azure Storage Account key (optional - uses Azure Identity if not set) |
| `DB_CONNECTION_STRING` | Yes | MongoDB connection string |

#### Investment Service (`backend/investment-service/.env`)
```
DB_CONNECTION_STRING=mongodb://localhost:27017/customer-analysis
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_CONNECTION_STRING` | Yes | MongoDB connection string |
| `CACHE_TTL` | No | Cache time-to-live in seconds (default: 900) |

#### Monitor Service (`backend/monitor-service/.env`)
```
DB_CONNECTION_STRING=mongodb://localhost:27017/customer-analysis
UPLOAD_SERVICE_URL=http://localhost:8000
INSIGHTS_SERVICE_URL=http://localhost:9000
INVESTMENT_SERVICE_URL=http://localhost:3004
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_CONNECTION_STRING` | Yes | MongoDB connection string |
| `UPLOAD_SERVICE_URL` | No | Internal URL for upload service health checks |
| `INSIGHTS_SERVICE_URL` | No | Internal URL for insights service health checks |
| `INVESTMENT_SERVICE_URL` | No | Internal URL for investment service health checks |
| `*_DISPLAY_URL` | No | External URLs shown in UI (for production) |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

This project is licensed under the MIT License.
