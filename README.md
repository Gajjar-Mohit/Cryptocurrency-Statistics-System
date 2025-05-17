# Cryptocurrency Statistics System

This project consists of two Node.js servers that work together to collect and expose cryptocurrency statistics.

## Project Structure

```
/
├── api-server/     # API server for exposing cryptocurrency statistics
├── worker-server/  # Worker server for triggering data collection
```

## Architecture Overview

![Architecture Diagram](https://mermaid.ink/img/pako:eNp1kV1rwjAUhv9KyHVBB7VeddPeKAy2wZiDMXbR5GgDTVLSpFOR_vskrdo53JeH8z55T3ISV0YjS3gmrUsYY5uPGCoU3BHBK9TE8qKoDCF4OGr0gdSE-1WLHaPdvkGuDn5UXFCJH1KuwjiSOvewUvSCKsKONoSiAu98FyXhmcGaC_CeE5tNDKZYnVBxMVDlxXrFCOaOfQSPLI2G6fPTbJrO0nSUjB-ep-kknYyGyYjdhzMhOuuqyMHZHJ5UmZ_v-kLeFrWQNAIoWMGuQFG5w0ZbSXVPqPkX6JCzrGNkpwY36FDwc2MKPnTNnXPZ_D9mPMzQkXLqpVntUCcg8yRJITN2B0-aNbYSQPEPKKTgkHnqvLOoheRXwVrWcDNvfVrZQOb1-BaywwZ5Dfn6G4UWnuU)

### Components

1. **API Server**:
   - Exposes endpoints for retrieving cryptocurrency statistics
   - Stores cryptocurrency data in MongoDB
   - Subscribes to events from the worker server via NATS

2. **Worker Server**:
   - Runs a background job every 15 minutes to trigger data collection
   - Publishes events to the API server via NATS

3. **MongoDB**:
   - Stores cryptocurrency statistics
   - Used by the API server to retrieve data

4. **NATS**:
   - Facilitates communication between the API server and worker server

## Data Flow

1. The worker server runs a background job every 15 minutes
2. When the job runs, it publishes an event to NATS with `{ "trigger": "update" }`
3. The API server receives this event and calls `storeCryptoStats()`
4. `storeCryptoStats()` fetches data from CoinGecko API and stores it in MongoDB
5. When a user requests statistics via the API, the API server retrieves the data from MongoDB

## Setup and Running

Please refer to the README files in the api-server and worker-server directories for specific setup instructions.

### Quick Start

1. Start MongoDB:
   ```
   mongod
   ```

2. Start NATS:
   ```
   docker run -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server -d nats:latest
   ```

3. Install and start the API server:
   ```
   cd api-server
   npm install
   npm run dev
   ```

4. Install and start the worker server:
   ```
   cd worker-server
   npm install
   npm run dev
   ```

## API Endpoints

### GET /stats

Get the latest statistics for a specific cryptocurrency.

Query Parameters:
- `coin`: The cryptocurrency to get statistics for (bitcoin, ethereum, or matic-network)

Example:
```
GET /stats?coin=bitcoin
```

### GET /stats?trigger=update

Trigger an immediate update of cryptocurrency statistics.

Example:
```
GET /stats?trigger=update
```

### GET /deviation

Get the standard deviation of price for a specific cryptocurrency over the last 100 records.

Query Parameters:
- `coin`: The cryptocurrency to calculate deviation for (bitcoin, ethereum, or matic-network)

Example:
```
GET /deviation?coin=bitcoin
```
