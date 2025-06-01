# AI-Powered Article Summarizer & Sentiment Analyzer API

## Description
This API provides functionality for analyzing articles, generating summaries, and analyzing sentiment using OpenRouter.ai's AI models.

## Features
- Article analysis and summarization
- Sentiment analysis
- User authentication
- Article saving and tagging
- Tag management
- Swagger documentation

## Tech Stack
- Node.js
- TypeScript
- Express.js
- TypeORM
- PostgreSQL
- OpenRouter.ai API
- JWT Authentication
- Swagger/OpenAPI

## Prerequisites
- Node.js (v20 or higher)
- PostgreSQL
- Docker and Docker Compose (for containerized setup)
- OpenRouter.ai API key

## Installation

### Using Docker (Recommended)
1. Clone the repository:
```bash
git clone <repository-url>
cd node-summarizer-api
```

2. Create `.env` file:
```bash
cp .env.example .env
```
Edit `.env` file and set your OpenRouter API key.

3. Build and start containers:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api-docs`

### Manual Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd node-summarizer-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```
Edit `.env` file and set your configuration.

4. Start the application:
```bash
npm run dev
```

## API Documentation
The API documentation is available at `/api-docs` when the server is running.

## Environment Variables
- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name
- `JWT_SECRET`: Secret key for JWT
- `OPENROUTER_API_KEY`: OpenRouter.ai API key
- `APP_URL`: Your application URL (used for OpenRouter API)

## License
MIT 