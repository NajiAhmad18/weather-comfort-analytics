# Weather Comfort Analytics

A secure full-stack weather analytics application built as a take-home assignment for Fidenz Technologies. It fetches real-time weather data for a configured set of cities, calculates a custom Comfort Index for each city, and presents a ranked dashboard accessible only to authenticated users.

---

## Features

- Custom weighted Comfort Index based on temperature, humidity, and wind speed
- City weather ranking from most to least comfortable
- 5-minute server-side cache for raw OpenWeather API responses
- Cache HIT/MISS debug endpoint
- Auth0 Universal Login authentication
- Protected API routes with JWT validation (Bearer token)
- Fail-closed authentication: missing Auth0 configuration returns 503, not unprotected data
- Sanitized authentication error responses (no stack traces or internal paths exposed)
- Responsive dashboard with city search, sorting, and comfort-range filtering
- Partial failure handling: cities that fail to load are reported separately without blocking the rest
- Temperature Trend Graph: a professional SVG visualization of real OpenWeather forecast data (approximately the next 24 hours at 3-hour intervals), with raw forecast responses cached server-side for 5 minutes. This is forecast data, not historical weather.

---

## Technology Stack

### Server

- Node.js / TypeScript
- Express 4
- `express-oauth2-jwt-bearer` — Auth0 JWT validation
- `node-cache` — in-memory TTL cache
- `dotenv` — environment configuration
- Jest + Supertest — unit and integration testing

### Client

- React 19 / TypeScript
- Vite 8
- `@auth0/auth0-react` — Auth0 SDK
- Vanilla CSS
- oxlint — linting

---

## Project Structure

```
weather-comfort-analytics/
├── server/
│   ├── src/
│   │   ├── app.ts                  # Express app setup and error handlers
│   │   ├── server.ts               # HTTP server entry point
│   │   ├── config/                 # Environment config
│   │   ├── controllers/            # Route handlers
│   │   ├── data/cities.json        # City codes and names
│   │   ├── middleware/             # JWT validation, auth error handler
│   │   ├── routes/                 # Express router definitions
│   │   ├── services/               # Business logic (weather, cache, comfort, analytics)
│   │   ├── types/                  # TypeScript interfaces
│   │   └── utils/                  # Shared utilities (clamp)
│   ├── tests/                      # Jest test suites
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── App.tsx                 # Auth gate and routing
    │   ├── components/             # Header, Auth0Provider, feedback states, controls
    │   ├── pages/                  # DashboardPage
    │   ├── services/               # Weather API client
    │   └── types/                  # Shared type definitions
    ├── .env.example
    └── package.json
```

---

## Comfort Index

The Comfort Index is a single score from 0 to 100 calculated server-side for each city. It combines three sub-scores, each independently scored 0–100, using fixed weights.

### Formula

```
Comfort Index = (Temperature Score × 0.50)
              + (Humidity Score    × 0.30)
              + (Wind Score        × 0.20)
```

The result is clamped to [0, 100] and rounded to one decimal place. Each sub-score is also rounded to one decimal place before being included in the response breakdown.

### Temperature Score (weight: 50%)

| Condition | Score |
|---|---|
| 18°C – 24°C (ideal) | 100 |
| Outside ideal range | 100 − (deviation × 8) |

Penalty: 8 points per degree Celsius outside the ideal band. A temperature of 10°C yields a score of 36. A temperature of 30°C yields a score of 52.

Temperature receives the highest weight because it is the dominant factor in perceived outdoor comfort.

### Humidity Score (weight: 30%)

| Condition | Score |
|---|---|
| 40% – 60% (ideal) | 100 |
| Outside ideal range | 100 − (deviation × 2.5) |

Penalty: 2.5 points per percentage point outside the ideal band. Humidity at 0% or 100% scores 0.

Humidity has a moderate weight because it significantly affects perceived temperature but is less immediately impactful than air temperature itself.

### Wind Speed Score (weight: 20%)

| Condition | Score |
|---|---|
| 1 – 5 m/s (ideal) | 100 |
| Below 1 m/s (still air) | 100 − ((1 − wind) × 20) |
| Above 5 m/s (strong wind) | 100 − ((wind − 5) × 15) |

Still air carries a lighter penalty than strong wind because calm conditions are generally preferable to gusty ones.

Wind carries the lowest weight as it is the least decisive factor in broad city-level comfort comparisons.

### Ranking and Tie-Breaking

Cities are sorted by Comfort Index descending. If two cities share the same score, they are ordered alphabetically by city name ascending.

---

## Weather Data and Cities

City codes are read from `server/src/data/cities.json`, which contains OpenWeather City ID codes and city names. On each rankings request, the loader reads the file and validates that at least 10 valid city entries are present.

Weather is fetched from the OpenWeather Current Weather API (`/data/2.5/weather`) using city codes, with results returned in metric units (°C, m/s).

---

## Caching

Raw OpenWeather API responses are cached in-process using `node-cache` with a 300-second (5-minute) TTL.

- On each city request the cache is checked first.
- A cache **HIT** returns the stored raw response without an external API call.
- A cache **MISS** fetches from OpenWeather, stores the result, and returns it.
- Each city response includes a `cacheStatus` field (`"HIT"` or `"MISS"`).
- The cache resets on process restart (it is in-memory only).

The cache status debug endpoint (protected, requires valid JWT) returns current hit/miss counts, key count, and TTL:

```
GET /api/cache/status
```

---

## Authentication and Security

Authentication uses Auth0 Universal Login. The flow:

1. The React SPA redirects unauthenticated users to Auth0 Universal Login.
2. After login, Auth0 issues an access token scoped to the configured API audience.
3. The frontend attaches the token as a `Bearer` header on every protected API request.
4. The Express backend validates the JWT signature, issuer, and audience using `express-oauth2-jwt-bearer`.
5. If token validation fails, the server returns `401 { "error": "Unauthorized" }` as JSON with no stack trace or internal details.
6. If Auth0 configuration (`AUTH0_DOMAIN` or `AUTH0_AUDIENCE`) is absent at request time, protected endpoints return `503 { "error": "Authentication service is not configured." }` rather than allowing access (fail-closed).
7. The React frontend also fails closed: if any of `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, or `VITE_AUTH0_AUDIENCE` are absent at build/runtime, the dashboard is never rendered and a configuration error screen is shown instead.

Public signups should be disabled in the Auth0 Dashboard. Users must be manually provisioned by an administrator. MFA is configured with OTP and Email factors and the policy is set to Always.

---

## Local Setup

### Prerequisites

- Node.js 20+
- An OpenWeather API key (free tier is sufficient)
- An Auth0 account with a configured SPA application and API (see Auth0 Setup below)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/NajiAhmad18/weather-comfort-analytics.git
cd weather-comfort-analytics

# 2. Install server dependencies
cd server
npm install

# 3. Create server environment file
cp .env.example .env
# Edit .env and fill in OPENWEATHER_API_KEY, AUTH0_DOMAIN, AUTH0_AUDIENCE

# 4. Install client dependencies
cd ../client
npm install

# 5. Create client environment file
cp .env.example .env
# Edit .env and fill in VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE
# If you change the server PORT, update VITE_API_BASE_URL to match

# 6. Start the backend (from the server/ directory)
cd ../server
npm run dev

# 7. Start the frontend (from the client/ directory, in a separate terminal)
cd ../client
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

The backend runs at `http://localhost:5000` by default.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Purpose |
|---|---|
| `OPENWEATHER_API_KEY` | OpenWeather API key used to fetch city weather data |
| `PORT` | Port for the Express server (default: `5000`) |
| `NODE_ENV` | Runtime environment (`development` or `production`) |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS (e.g. `http://localhost:5173`) |
| `AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `your-tenant.us.auth0.com`) |
| `AUTH0_AUDIENCE` | Auth0 API identifier / audience (e.g. `https://weather-comfort-analytics-api`) |

### Client (`client/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:5000`) |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain (must match server) |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA application client ID |
| `VITE_AUTH0_AUDIENCE` | Auth0 API identifier (must match server) |

Never commit `.env` files. Both are listed in `.gitignore`.

---

## Auth0 Dashboard Setup

1. **Create an Application**: Applications > Create Application > Single Page Application.
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
   - Copy the Domain and Client ID into `client/.env`.

2. **Create an API**: Applications > APIs > Create API.
   - Identifier: set to the same value used for `AUTH0_AUDIENCE` (e.g. `https://weather-comfort-analytics-api`).
   - Signing Algorithm: RS256.
   - In the SPA application's settings, grant it user-delegated access to this API.

3. **Database Connection**: Authentication > Database > Username-Password-Authentication.
   - Disable "Allow signups" so that only manually created users can authenticate.
   - Disable unnecessary social connections if present.

4. **Create Users**: User Management > Users > Create User.
   - Manually add each user who should have access to the dashboard.

5. **MFA**: Security > Multi-factor Auth.
   - Enable OTP (Authenticator App) and Email as factors.
   - Set MFA Policy to Always.
   - Enable MFA method selection if required.

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server health check |
| `GET` | `/api/weather/rankings` | Protected (Bearer JWT) | Returns ranked city comfort data |
| `GET` | `/api/cache/status` | Protected (Bearer JWT) | Returns cache hit/miss statistics and TTL |
| `GET` | `/api/weather/forecast/:cityCode` | Protected (Bearer JWT) | Returns ~24-hour temperature forecast for a configured city (raw response cached 5 min) |

Missing Auth0 configuration returns `503` on protected routes. Invalid or absent tokens return `401`.

---

## Testing and Build Verification

```bash
# Run all server tests
cd server
npm test -- --runInBand

# Build the server TypeScript
npm run build

# Build the client
cd ../client
npm run build

# Lint the client
npm run lint
```

---

## Design Decisions

**Custom weighted Comfort Index** — A single score derived from temperature, humidity, and wind speed gives reviewers a clear, comparable metric for each city. Weights reflect the relative human impact of each factor.

**Server-side computation** — All weather fetching and Comfort Index calculation happens on the backend. The frontend receives pre-ranked data, which keeps client-side logic simple and the computation testable.

**Raw response caching** — Caching the unmodified OpenWeather response (rather than derived scores) means that if the Comfort Index formula changes, cached data can be recalculated without an additional API call. The 5-minute TTL balances freshness with API quota usage.

**Partial failure handling** — All city requests are made concurrently via `Promise.allSettled`. Failed cities are collected into an `errors` array and reported separately. The dashboard continues to function with the cities that succeed.

**Auth0 instead of custom authentication** — Auth0 handles credential storage, hashing, token issuance, MFA, and account management. This avoids the security risks and implementation cost of building those from scratch.

**In-memory cache trade-off** — `node-cache` is straightforward to set up and sufficient for a single-process demonstration. It resets on restart and does not share state between multiple server instances. A distributed cache would be needed for production deployments.

---

## Limitations

- The application depends on a valid OpenWeather API key. Requests fail if the key is absent or invalid.
- The in-memory cache is lost on every process restart. There is no warm-up on startup.
- Auth0 tenant configuration (application settings, API, users, MFA) is external to this repository and must be completed manually before authentication works end-to-end.
- City configuration is file-based and static rather than managed through a database or administrative interface.

---

## Security Notes

- Never commit `.env` files or any file containing API keys, Auth0 secrets, or passwords.
- Both `server/.env` and `client/.env` are excluded by `.gitignore`.
- Only placeholder values appear in `.env.example` files.
