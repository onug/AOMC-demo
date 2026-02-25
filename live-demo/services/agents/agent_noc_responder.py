"""NOC Responder Agent — periodically checks alerts and responds."""

import time

from base_agent import BaseAgent

INTERVAL = float(__import__("os").getenv("AGENT_INTERVAL", "10"))


def run():
    agent = BaseAgent("agent-noc-responder")
    agent.logger.info("Starting NOC responder agent")

    while True:
        try:
            # Read metrics
            agent.get("/api/metrics")
            time.sleep(2)

            # Read logs
            agent.get("/api/metrics/logs")
            time.sleep(2)

            # Check alerts
            resp = agent.get("/api/metrics/alerts")
            if resp.status_code == 200:
                data = resp.json()
                alerts = data.get("alerts", [])
                for alert in alerts:
                    if alert.get("severity") == "critical":
                        agent.logger.info(f"Critical alert: {alert.get('message')}")
                        agent.post(
                            "/api/tools/restart_service",
                            json={"service": "affected-service"},
                        )

            time.sleep(INTERVAL)
        except Exception as e:
            agent.logger.error(f"Error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    run()
