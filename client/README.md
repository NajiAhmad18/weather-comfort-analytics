# Weather Comfort Analytics — Frontend

This is the React/TypeScript client for the Weather Comfort Analytics application.

For full setup instructions, environment variables, Auth0 configuration, and project documentation, see the [root README](../README.md).

## Development

```bash
# Install dependencies
npm install

# Copy environment file and fill in Auth0/API values
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

The development server runs at `http://localhost:5173` by default. The backend must be running before the frontend can load weather data.
