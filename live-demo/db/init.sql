-- AOMC Live Demo — Database Schema
-- PostgreSQL 16

-- Agent registry
CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL CHECK (domain IN ('trusted', 'untrusted')),
    role TEXT NOT NULL,
    cert_cn TEXT NOT NULL,
    label TEXT NOT NULL,
    quarantined BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer PII records
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ssn TEXT NOT NULL,
    balance TEXT NOT NULL,
    email TEXT NOT NULL
);

-- PCI cardholder data (bulk-loaded from synthetic_chd.csv)
CREATE TABLE cardholder_data (
    id SERIAL PRIMARY KEY,
    pan TEXT NOT NULL,
    network TEXT NOT NULL,
    expiry TEXT NOT NULL,
    cvv TEXT NOT NULL,
    cardholder_name TEXT NOT NULL,
    cardholder_email TEXT,
    phone TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    issuing_bank TEXT,
    account_status TEXT
);

-- Tool permissions (agent_id -> tool_name)
CREATE TABLE tool_permissions (
    agent_id TEXT NOT NULL REFERENCES agents(id),
    tool_name TEXT NOT NULL,
    PRIMARY KEY (agent_id, tool_name)
);

-- Risk levels for tools
CREATE TABLE risk_levels (
    tool_name TEXT PRIMARY KEY,
    risk TEXT NOT NULL CHECK (risk IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- Zero-trust cross-domain policies
CREATE TABLE zero_trust_policies (
    id SERIAL PRIMARY KEY,
    src_domain TEXT NOT NULL,
    dst_domain TEXT NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT
);

-- AOMC control states
CREATE TABLE controls (
    key TEXT PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT NOT NULL,
    number INTEGER NOT NULL,
    poll_pct INTEGER NOT NULL,
    maestro_layer TEXT NOT NULL
);

-- Tamper-evident audit trail
CREATE TABLE audit_trail (
    id SERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    result TEXT NOT NULL,
    detail TEXT,
    prev_hash TEXT,
    hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_trail_ts ON audit_trail(ts);
CREATE INDEX idx_audit_trail_agent ON audit_trail(agent);

-- Runtime behavioral profiles (sliding window)
CREATE TABLE agent_activity (
    id SERIAL PRIMARY KEY,
    agent_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'GET',
    data_bytes INTEGER NOT NULL DEFAULT 0,
    ts TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_activity_agent_ts ON agent_activity(agent_id, ts);

-- Pending approval requests (autonomy governance)
CREATE TABLE approval_requests (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    risk TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
