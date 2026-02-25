-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================
-- API KEYS
-- =====================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  hashed_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- USAGE EVENTS (append-only)
-- =====================
CREATE TABLE usage_events (
  id BIGSERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INT NOT NULL,
  completion_tokens INT NOT NULL,
  total_tokens INT NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_events_key_time
  ON usage_events(api_key_id, created_at);

-- =====================
-- DAILY AGGREGATION
-- =====================
CREATE TABLE daily_usage (
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_tokens INT NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  PRIMARY KEY (api_key_id, date)
);

-- =====================
-- MONTHLY AGGREGATION (OPTIMIZATION)
-- =====================
CREATE TABLE monthly_usage (
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- YYYY-MM-01
  total_tokens INT NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  PRIMARY KEY (api_key_id, month)
);

-- =====================
-- BUDGETS
-- =====================
CREATE TABLE budgets (
  api_key_id UUID PRIMARY KEY REFERENCES api_keys(id) ON DELETE CASCADE,
  daily_limit_usd NUMERIC(10,2),
  monthly_limit_usd NUMERIC(10,2),
  alert_thresholds NUMERIC[] DEFAULT ARRAY[0.5, 0.8, 1.0],
  webhook_url TEXT
);

-- =====================
-- RATE LIMITS
-- =====================
CREATE TABLE rate_limits (
  api_key_id UUID PRIMARY KEY REFERENCES api_keys(id) ON DELETE CASCADE,
  requests_per_minute INT NOT NULL
);