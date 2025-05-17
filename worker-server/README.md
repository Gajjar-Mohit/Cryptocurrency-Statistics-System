# Worker Server for Cryptocurrency Statistics

This server runs a background job to trigger cryptocurrency data collection in the API server via NATS.

## Features

- Run a background job every 15 minutes using node-cron
- Communicate with the API server via NATS

## Prerequisites

- Node.js (v14 or higher)
- NATS Server

## Installation

1. Clone the repository
2. Navigate to the worker-server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file with the following variables:

```
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

## Architecture

This server has a simple architecture:

- **App**: Manages the server lifecycle
- **Services**: Handle communication with NATS
- **Utils**: Provide utility functions like logging

## Background Job

The server uses node-cron to schedule a job that runs every 15 minutes. When the job runs, it publishes an event to the "crypto.update" subject in NATS with the following payload:

```json
{ "trigger": "update" }
```

The API server subscribes to this event and triggers the `storeCryptoStats()` function when it receives the event.

## Communication with API Server

The worker server communicates with the API server via NATS. It publishes events to the "crypto.update" subject, which the API server subscribes to.
