# Isohel | Visualise the world's sunshine

Web-application which plots world sunlight data and joins cities together that share the same amount (also known as an isohel). Updates daily with new data from OpenWeatherMap.

**Hosted on Cloudflare Pages** with secure API endpoints and automated data updates.

## Tech Stack

Built using:
 - [T3 Stack](https://create.t3.gg/) - Next.js, tRPC, Prisma, TypeScript
 - [Mapbox GL JS](https://www.mapbox.com/) - Interactive mapping
 - [OpenWeatherMap API](https://openweathermap.org/) - Real-time weather data
 - [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting & deployment
 - [Neon PostgreSQL](https://neon.tech/) - Serverless database

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Database (Neon PostgreSQL recommended)
- API keys (OpenWeatherMap, Mapbox)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd sunshine

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Initialize database
pnpm prisma generate
pnpm prisma db push

# Start development server
pnpm dev
```

Visit `http://localhost:3000`

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for Cloudflare Pages
- **[SECURITY.md](SECURITY.md)** - Security features and best practices
- **[CLOUDFLARE_MIGRATION.md](CLOUDFLARE_MIGRATION.md)** - Migration guide from Vercel

## Inspiration

Original inspiration for this comes from a song called '[isohel](https://www.youtube.com/watch?v=asuA2-pbch0)' by EDEN.

The idea really resonated with me and I thought it would be cool to build something in homage to this.

## Calculations and Accuracy

Each city then gets a sunlight duration assigned to it via a simple subtraction of `sunset - sunrise`, 2 common data points returned from OpenWeatherMap.

Due to the nature of our method of calculation, 'true' isohels are actually close to/almost impossible to find without approximating our results.

e.g. if Madrid has a sunlight duration of 52,756, and if Istanbul has a sunlight duration of 52,856 - they would not share an isohel if we leave them like this.

Sunlight duration is rounded up as a measure to ensure this application isn't too accurate to the point where it is not showing any data at all.
