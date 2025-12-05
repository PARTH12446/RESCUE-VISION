-- PostgreSQL schema for Rescue Visioncd server

-- Drop tables in reverse dependency order (for development resets)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS disasters CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table: admins, responders, civilians
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'responder', 'civilian')),
    full_name       VARCHAR(255),
    phone_number    VARCHAR(30),
    location        VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disasters table: high-level disaster events
CREATE TABLE IF NOT EXISTS disasters (
    id              SERIAL PRIMARY KEY,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    location        VARCHAR(255),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    severity        VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reported_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports table: individual user reports linked to a disaster
CREATE TABLE IF NOT EXISTS reports (
    id              SERIAL PRIMARY KEY,
    disaster_id     INTEGER NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
    reported_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description     TEXT,
    media_url       TEXT,
    severity        VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasters (status);
CREATE INDEX IF NOT EXISTS idx_disasters_severity ON disasters (severity);
CREATE INDEX IF NOT EXISTS idx_reports_disaster_id ON reports (disaster_id);

-- =============================================================
-- Additional tables used by DataService and dashboard APIs
-- =============================================================

-- Resources table for resource management
CREATE TABLE IF NOT EXISTS resources (
    id          SERIAL PRIMARY KEY,
    type        VARCHAR(50) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 0,
    available   INTEGER NOT NULL DEFAULT 0,
    location    VARCHAR(255),
    status      VARCHAR(50) NOT NULL DEFAULT 'available',
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ
);

-- Alerts table for real-time alerts
CREATE TABLE IF NOT EXISTS alerts (
    id          SERIAL PRIMARY KEY,
    type        VARCHAR(50) NOT NULL,
    severity    VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    location    VARCHAR(255),
    status      VARCHAR(50) NOT NULL DEFAULT 'active',
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ
);

-- Predictions table used by AI features
CREATE TABLE IF NOT EXISTS disaster_predictions (
    id                  SERIAL PRIMARY KEY,
    type                VARCHAR(50) NOT NULL,
    location            VARCHAR(255) NOT NULL,
    coordinates         JSONB,
    probability         NUMERIC(5,2) NOT NULL,
    severity            VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    predicted_time      TIMESTAMPTZ,
    affected_population INTEGER,
    risk_score          NUMERIC(6,2),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

-- Historical dashboard data (monthly aggregates)
CREATE TABLE IF NOT EXISTS historical_data (
    id           SERIAL PRIMARY KEY,
    month        VARCHAR(10) NOT NULL,
    year         INTEGER NOT NULL,
    predictions  INTEGER NOT NULL DEFAULT 0,
    alerts       INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reported disasters table backing the report feature
CREATE TABLE IF NOT EXISTS reported_disasters (
    id               SERIAL PRIMARY KEY,
    type             VARCHAR(50) NOT NULL,
    severity         VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    location         VARCHAR(255),
    coordinates      JSONB,
    status           VARCHAR(50) NOT NULL DEFAULT 'reported',
    reporter_name    VARCHAR(255),
    reporter_contact VARCHAR(255),
    evidence_urls    JSONB,
    timestamp        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);