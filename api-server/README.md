# API Server for Cryptocurrency Statistics

This server provides APIs for cryptocurrency statistics and communicates with a worker server via NATS to keep the data up-to-date.

## Features

- Fetch and store cryptocurrency statistics from CoinGecko API
- Provide APIs for retrieving the latest statistics and price deviation
- Communicate with a worker server via NATS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- NATS Server

## Installation

1. Clone the repository
2. Navigate to the api-server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file with the following variables:

```
PORT=3000
MONGO_URI=mongodb://admin:password@localhost:27017/yourdatabase?authSource=admin
NATS_URL=nats://localhost:4222
NODE_ENV=development
```

## Running the Server

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

## API Endpoints

### GET /stats

Get the latest statistics for a specific cryptocurrency.

**Query Parameters:**
- `coin` - The cryptocurrency to get statistics for (bitcoin, ethereum, or matic-network)

**Example:**
```
GET /stats?coin=bitcoin
```

**Response:**
```json
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
```

### GET /stats?trigger=update

Trigger an immediate update of cryptocurrency statistics.

**Query Parameters:**
- `trigger` - Set to "update" to trigger an update

**Example:**
```
GET /stats?trigger=update
```

**Response:**
```json
{
  "message": "Update triggered successfully"
}
```

### GET /deviation

Get the standard deviation of price for a specific cryptocurrency over the last 100 records.

**Query Parameters:**
- `coin` - The cryptocurrency to calculate deviation for (bitcoin, ethereum, or matic-network)

**Example:**
```
GET /deviation?coin=bitcoin
```

**Response:**
```json
{
  "deviation": 4082.48
}
```

## Architecture

This server follows a modular architecture with the following components:

- **Models**: Define the database schema
- **Controllers**: Handle API requests and responses
- **Services**: Contain business logic
- **Routes**: Define API endpoints
- **Utils**: Provide utility functions

## Communication with Worker Server

This server subscribes to the "crypto.update" event from the worker server via NATS. When this event is received, it triggers the `storeCryptoStats()` function to update the cryptocurrency statistics in the database.
