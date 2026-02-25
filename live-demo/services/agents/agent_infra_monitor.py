"""Infrastructure Monitor Agent — periodically reads metrics and sends alerts."""

import time
import random

from base_agent import BaseAgent

INTERVAL = float(__import__("os").getenv("AGENT_INTERVAL", "8"))


def run():
    agent = BaseAgent("agent-infra-monitor")
    agent.logger.info("Starting infrastructure monitor agent")

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
                if alerts:
                    # Send alert to NOC
                    agent.post(
                        "/api/tools/send_alert",
                        json={"message": alerts[0].get("message", "Alert detected")},
                    )

            time.sleep(INTERVAL)
        except Exception as e:
            agent.logger.error(f"Error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    run()
