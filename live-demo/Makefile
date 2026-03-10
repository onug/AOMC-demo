.PHONY: up down build reset attack stop logs logs-agents logs-rogue logs-gateway logs-control status clean certs vendor-up vendor-down vendor-status vendor-clean

# ── Primary targets ──────────────────────────────────────────

up: ## Start all services
	docker compose up --build -d
	@echo ""
	@echo "  Dashboard:      http://localhost:3000"
	@echo "  Control Plane:  http://localhost:8000"
	@echo "  Rogue Agent:    http://localhost:9000"
	@echo ""
	@echo "  Waiting for services to be healthy..."
	@docker compose ps

down: ## Stop all services
	docker compose down

build: ## Build all images without starting
	docker compose build

# ── Demo controls ────────────────────────────────────────────

attack: ## Launch rogue agent attack
	@curl -s -X POST http://localhost:9000/trigger | python3 -m json.tool
	@echo "Rogue agent launched!"

stop: ## Stop rogue agent attack
	@curl -s -X POST http://localhost:9000/stop | python3 -m json.tool

reset: ## Reset all state (controls, quarantine, audit)
	@curl -s -X POST http://localhost:8000/api/reset | python3 -m json.tool
	@echo "State reset!"

controls-on: ## Enable all 6 AOMC controls
	@curl -s -X POST "http://localhost:8000/api/controls/all?enabled=true" | python3 -m json.tool

controls-off: ## Disable all 6 AOMC controls
	@curl -s -X POST "http://localhost:8000/api/controls/all?enabled=false" | python3 -m json.tool

status: ## Show rogue agent status
	@curl -s http://localhost:9000/status | python3 -m json.tool

audit: ## Show audit trail
	@curl -s http://localhost:8000/api/audit | python3 -m json.tool

# ── Logging ──────────────────────────────────────────────────

logs: ## Show all logs
	docker compose logs -f

logs-agents: ## Show agent logs
	docker compose logs -f agent-infra-monitor agent-noc-responder agent-data-analyst agent-partner-api agent-rogue-7749

logs-rogue: ## Show rogue agent logs
	docker compose logs -f agent-rogue-7749

logs-gateway: ## Show gateway logs
	docker compose logs -f aomc-gateway

logs-control: ## Show control plane logs
	docker compose logs -f aomc-control-plane

# ── Vendor plugin mode ──────────────────────────────────────

vendor-up: ## Start with vendor plugins
	docker compose -f docker-compose.yml -f docker-compose.vendor.yml up --build -d
	@echo ""
	@echo "  Dashboard:      http://localhost:3000"
	@echo "  Control Plane:  http://localhost:8000"
	@echo "  Rogue Agent:    http://localhost:9000"
	@echo ""
	@echo "  Vendor mode active — checking vendor status..."
	@sleep 5
	@curl -s http://localhost:8000/api/vendors | python3 -m json.tool

vendor-down: ## Stop all services (vendor mode)
	docker compose -f docker-compose.yml -f docker-compose.vendor.yml down

vendor-status: ## Show active vendor providers
	@curl -s http://localhost:8000/api/vendors | python3 -m json.tool

vendor-clean: ## Full cleanup (vendor mode)
	docker compose -f docker-compose.yml -f docker-compose.vendor.yml down -v --remove-orphans
	@echo "Cleaned up all containers and volumes (vendor mode)."

# ── Maintenance ──────────────────────────────────────────────

certs: ## Regenerate certificates
	cd certs && bash generate-certs.sh

clean: ## Stop services and remove volumes
	docker compose down -v --remove-orphans
	@echo "Cleaned up all containers and volumes."

# ── Help ─────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
