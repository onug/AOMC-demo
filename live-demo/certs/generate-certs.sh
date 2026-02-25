#!/bin/bash
# Generate CA + per-agent mTLS certificates for AOMC live demo
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")" && pwd)"
CA_DIR="$CERT_DIR/ca"
AGENT_DIR="$CERT_DIR/agents"

echo "=== AOMC Certificate Generation ==="

rm -rf "$CA_DIR" "$AGENT_DIR"
mkdir -p "$CA_DIR" "$AGENT_DIR"

# --- Root CA ---
echo "[1/3] Generating Root CA..."
openssl genrsa -out "$CA_DIR/ca.key" 4096 2>/dev/null
openssl req -new -x509 -days 365 -key "$CA_DIR/ca.key" \
    -out "$CA_DIR/ca.crt" \
    -subj "/C=US/O=AOMC-Demo/CN=AOMC Root CA" 2>/dev/null

# --- Per-agent certs (signed by CA) ---
TRUSTED_AGENTS="agent-infra-monitor agent-noc-responder agent-data-analyst"
UNTRUSTED_AGENTS="agent-partner-api"

generate_agent_cert() {
    local agent="$1"
    local dir="$AGENT_DIR/$agent"
    mkdir -p "$dir"

    echo "  Generating cert for $agent..."
    openssl genrsa -out "$dir/agent.key" 2048 2>/dev/null
    openssl req -new -key "$dir/agent.key" \
        -out "$dir/agent.csr" \
        -subj "/C=US/O=AOMC-Demo/CN=$agent" 2>/dev/null
    openssl x509 -req -days 365 \
        -in "$dir/agent.csr" \
        -CA "$CA_DIR/ca.crt" -CAkey "$CA_DIR/ca.key" -CAcreateserial \
        -out "$dir/agent.crt" 2>/dev/null
    rm "$dir/agent.csr"
}

echo "[2/3] Generating trusted agent certificates..."
for agent in $TRUSTED_AGENTS $UNTRUSTED_AGENTS; do
    generate_agent_cert "$agent"
done

# --- Rogue agent cert (self-signed, NOT signed by CA) ---
echo "[3/3] Generating rogue agent certificate (self-signed)..."
ROGUE_DIR="$AGENT_DIR/agent-rogue-7749"
mkdir -p "$ROGUE_DIR"
openssl genrsa -out "$ROGUE_DIR/agent.key" 2048 2>/dev/null
openssl req -new -x509 -days 365 -key "$ROGUE_DIR/agent.key" \
    -out "$ROGUE_DIR/agent.crt" \
    -subj "/C=US/O=FAKE-ORG/CN=agent-infra-monitor" 2>/dev/null

# --- Gateway server cert (signed by CA) ---
echo "  Generating gateway server certificate..."
GW_DIR="$AGENT_DIR/gateway"
mkdir -p "$GW_DIR"
openssl genrsa -out "$GW_DIR/server.key" 2048 2>/dev/null
openssl req -new -key "$GW_DIR/server.key" \
    -out "$GW_DIR/server.csr" \
    -subj "/C=US/O=AOMC-Demo/CN=aomc-gateway" 2>/dev/null

# Create SAN config for gateway
cat > "$GW_DIR/san.cnf" <<EOF
[req]
distinguished_name = req_distinguished_name
[req_distinguished_name]
[v3_req]
subjectAltName = DNS:aomc-gateway,DNS:localhost,IP:127.0.0.1
EOF

openssl x509 -req -days 365 \
    -in "$GW_DIR/server.csr" \
    -CA "$CA_DIR/ca.crt" -CAkey "$CA_DIR/ca.key" -CAcreateserial \
    -out "$GW_DIR/server.crt" \
    -extensions v3_req -extfile "$GW_DIR/san.cnf" 2>/dev/null
rm "$GW_DIR/server.csr" "$GW_DIR/san.cnf"

echo ""
echo "=== Done ==="
echo "CA cert:     $CA_DIR/ca.crt"
echo "Agent certs: $AGENT_DIR/<agent-name>/agent.crt"
echo "Gateway:     $GW_DIR/server.crt"
echo "Rogue cert:  $ROGUE_DIR/agent.crt (SELF-SIGNED, will fail CA validation)"
