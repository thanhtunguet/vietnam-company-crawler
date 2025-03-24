# Vietnam Business Database & API Platform

A scalable web crawler and API platform for accessing detailed information on businesses registered in Vietnam, including their tax information, legal representative, and address. This project consists of:

- **Crawler Microservice**: Crawls company data from [infodoanhnghiep.com](https://infodoanhnghiep.com).
- **Main API Service**: Provides RESTful APIs to trigger crawl jobs and access business data.
- **Frontend Control Panel**: React-based UI for managing crawl jobs.
- **Database**: SQL Server for storing business and job tracking data.

---

## Features
- Crawl data by:
  - All provinces (Full crawl)
  - Specific province
  - Specific page
  - Specific company detail
  - Latest N pages of all provinces (incremental crawl)
- Job management with progress tracking
- MQTT-based microservice communication
- TypeORM support for SQL Server
- React + Bootstrap UI for job control and monitoring

---

## Technologies Used
- **Backend**: Nest.js, TypeORM, MQTT, Axios, Cheerio
- **Frontend**: React, TypeScript, Bootstrap
- **Database**: SQL Server
- **Messaging**: MQTT broker (e.g., Mosquitto)

---

## API Endpoints
| Method | Endpoint                        | Description                            |
| ------ | ------------------------------- | -------------------------------------- |
| POST   | `/api/crawl/full`               | Trigger full crawl for all provinces   |
| POST   | `/api/crawl/province/:province` | Trigger crawl for specific province    |
| POST   | `/api/crawl/page`               | Trigger crawl for specific page        |
| POST   | `/api/crawl/detail`             | Trigger crawl for specific company     |
| POST   | `/api/crawl/partial`            | Crawl N newest pages for all provinces |
| GET    | `/api/crawl/status/:jobId`      | Get status of a specific crawl job     |
| GET    | `/api/crawl/jobs`               | List recent crawl jobs                 |

---

## Database Schema Overview
### Table: `crawl_jobs`
| Field       | Type          | Description                                 |
| ----------- | ------------- | ------------------------------------------- |
| id          | UUID          | Job ID                                      |
| type        | NVARCHAR(20)  | Job type ('full', 'province', etc.)         |
| status      | NVARCHAR(20)  | Job status ('pending', 'in_progress', etc.) |
| progress    | FLOAT         | Progress percentage                         |
| province    | NVARCHAR(100) | Province name (nullable)                    |
| page_number | INT           | Page number (nullable)                      |
| company_url | NVARCHAR(500) | Company URL (nullable)                      |
| started_at  | DATETIME2     | Start time                                  |
| finished_at | DATETIME2     | End time                                    |
| log         | NVARCHAR(MAX) | Job logs or errors (nullable)               |

---

## Installation & Setup
1. Clone repository and install dependencies:
```bash
npm install
```
2. Configure environment variables:
- SQL Server connection string
- MQTT broker URL
3. Run the main API service:
```bash
npm run start:main
```
4. Run the crawler microservice:
```bash
npm run start:crawler
```
5. Launch frontend (React app):
```bash
npm run start:frontend
```

---

## License
MIT License

---

## Author
Developed by [thanhtunguet]
Contact: [ht@thanhtunguet.info]

