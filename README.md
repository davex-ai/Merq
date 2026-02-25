# Merq ⚡

Merq is an open-source API gateway for tracking, limiting, and billing LLM usage.

It sits between your app and providers like OpenAI or Anthropic and gives you:
- Token & cost tracking
- Per-key budgets
- Rate limiting
- Usage aggregation
- Billing exports
- Alerts & webhooks

## Why Merq?

LLM usage is expensive and unpredictable.
Merq makes it observable and enforceable.

## Features

- ✅ Per-request token tracking
- ✅ Per-API-key daily & monthly cost aggregation
- ✅ Redis-backed rate limiting
- ✅ Budget limits with soft alerts
- ✅ PostgreSQL persistence
- ✅ Provider-agnostic architecture
- ✅ Open-source

## Quick Start

```bash
git clone https://github.com/yourname/merq
cd merq
npm install
npm run migrate
npm run dev
```

## Environment Variables
```bash
DATABASE_URL=postgres://...
REDIS_URL=redis://...
```