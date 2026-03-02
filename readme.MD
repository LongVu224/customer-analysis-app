# Customer Analysis App

A full-stack application for analyzing customer data, providing insights through a modern frontend and robust backend services. Deployed on **Azure Container Apps** with full CI/CD automation.

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

Customer Analysis App enables businesses to upload, manage, and analyze customer data, visualize trends, and generate actionable insights.

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
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ Upload Svc  │ │ Insights Svc│ │ Monitor Svc │                │
│  │ :8000       │ │ :9000       │ │ :8999       │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                 │
│  Azure Container Registry (ACR) ← Stores Docker images          │
│  Managed Identity ← Secure image pulls                          │
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
- **Backend:** 3 Node.js microservices (upload, insights, monitor)
- **Database:** MongoDB
- **Storage:** Azure Storage Account
- **Registry:** Azure Container Registry (ACR)
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
| `container-registry.bicep` | Azure Container Registry |
| `container-apps.bicep` | Container Apps Environment + 4 apps |
| `storage-account.bicep` | Azure Storage Account |
| `key-vault.bicep` | Azure Key Vault |
| `monitoring.bicep` | App Insights + Log Analytics |

### Azure Resources Created

```
customer-analysis-rg/
├── customeranalysisacr          (Container Registry)
├── customer-analysis-env        (Container Apps Environment)
│   ├── customer-analysis-frontend   (Frontend Container App)
│   ├── customer-analysis-upload     (Upload Service)
│   ├── customer-analysis-insights   (Insights Service)
│   └── customer-analysis-monitor    (Monitor Service)
├── customer-analysis-ai         (Application Insights)
├── customer-analysis-law        (Log Analytics Workspace)
├── customeranalysisstorage      (Storage Account)
└── customer-analysis-kv         (Key Vault)
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
│              │    │              │    │   ACR        │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Prerequisites

1. **Azure DevOps Service Connection**: `customer-analysis-connection`
2. **Resource Group**: `customer-analysis-rg` (create beforehand)
3. **Environment**: `customer-analysis` in Azure DevOps

### Deploy Infrastructure Manually

```bash
# Login to Azure
az login

# Create resource group
az group create --name customer-analysis-rg --location westeurope

# Deploy Bicep templates
az deployment group create \
  --resource-group customer-analysis-rg \
  --template-file infrastructure/templates/main.bicep \
  --parameters infrastructure/templates/main.bicepparam
```

### Build and Push Images Manually

```bash
# Login to ACR
az acr login --name customeranalysisacr

# Build and push (from project root)
az acr build --registry customeranalysisacr --image upload-service:latest --file backend/upload-service/.dockerfile backend/upload-service
az acr build --registry customeranalysisacr --image insights-service:latest --file backend/insights-service/.dockerfile backend/insights-service
az acr build --registry customeranalysisacr --image monitor-service:latest --file backend/monitor-service/.dockerfile backend/monitor-service
az acr build --registry customeranalysisacr --image frontend:latest --file frontend/.dockerfile frontend
```

### Local Development with Docker

```bash
# Build and run individual services
cd backend/upload-service
docker build -f .dockerfile -t upload-service .
docker run -p 8000:8000 upload-service

# Or use docker-compose for all services (create your own docker-compose.yaml)
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
