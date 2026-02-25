-- AOMC Live Demo — Seed Data (from demo.py / data.ts)

-- Agents
INSERT INTO agents (id, domain, role, cert_cn, label) VALUES
    ('agent-infra-monitor', 'trusted',   'infrastructure_monitor', 'agent-infra-monitor', 'Infra Monitor'),
    ('agent-noc-responder', 'trusted',   'incident_responder',     'agent-noc-responder', 'NOC Responder'),
    ('agent-data-analyst',  'trusted',   'data_analyst',           'agent-data-analyst',  'Data Analyst'),
    ('agent-partner-api',   'untrusted', 'partner_integration',    'agent-partner-api',   'Partner API');

-- Customers (PII)
INSERT INTO customers (name, ssn, balance, email) VALUES
    ('Sarah Chen',      '***-**-4821', '$2.4M', 's.chen@globalbank.com'),
    ('Marcus Williams', '***-**-9132', '$890K', 'm.williams@globalbank.com'),
    ('Priya Patel',     '***-**-3374', '$5.1M', 'p.patel@globalbank.com'),
    ('James O''Brien',  '***-**-7765', '$320K', 'j.obrien@globalbank.com'),
    ('Yuki Tanaka',     '***-**-5519', '$1.7M', 'y.tanaka@globalbank.com');

-- Tool permissions
INSERT INTO tool_permissions (agent_id, tool_name) VALUES
    ('agent-infra-monitor', 'read_metrics'),
    ('agent-infra-monitor', 'read_logs'),
    ('agent-infra-monitor', 'send_alert'),
    ('agent-noc-responder', 'read_metrics'),
    ('agent-noc-responder', 'read_logs'),
    ('agent-noc-responder', 'send_alert'),
    ('agent-noc-responder', 'restart_service'),
    ('agent-data-analyst',  'read_metrics'),
    ('agent-data-analyst',  'read_anonymized_data'),
    ('agent-partner-api',   'read_public_data');

-- Risk levels
INSERT INTO risk_levels (tool_name, risk) VALUES
    ('read_metrics',           'LOW'),
    ('read_logs',              'LOW'),
    ('read_public_data',       'LOW'),
    ('read_anonymized_data',   'LOW'),
    ('send_alert',             'MEDIUM'),
    ('restart_service',        'MEDIUM'),
    ('modify_firewall_rules',  'HIGH'),
    ('inject_bgp_routes',      'HIGH'),
    ('dump_auth_tokens',       'HIGH'),
    ('wipe_audit_logs',        'HIGH'),
    ('shutdown_auth_service',  'HIGH'),
    ('disable_observability_stack', 'HIGH'),
    ('broadcast_to_agent_mesh','HIGH'),
    ('modify_identity_provider','HIGH');

-- AOMC controls (all OFF by default)
INSERT INTO controls (key, enabled, name, number, poll_pct, maestro_layer) VALUES
    ('identity_attestation', FALSE, 'Identity Attestation',   1, 78, 'Layer 1'),
    ('runtime_monitoring',   FALSE, 'Runtime Monitoring',     2, 65, 'Layer 4'),
    ('data_guardrails',      FALSE, 'Data Guardrails',        3, 92, 'Layer 3'),
    ('zero_trust',           FALSE, 'Zero-Trust Enforcement', 4, 67, 'Layer 2'),
    ('tool_authorization',   FALSE, 'Tool Authorization',     5, 71, 'Layer 5'),
    ('autonomy_governance',  FALSE, 'Autonomy Governance',    6, 56, 'Layer 6');

-- Zero-trust policies (no cross-domain policies by default = everything blocked when ZT is on)
-- Legitimate same-domain communication is allowed by default
