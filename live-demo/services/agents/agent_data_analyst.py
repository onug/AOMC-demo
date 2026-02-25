"""Data Analyst Agent — periodically reads anonymized customer data."""

import time

from base_agent import BaseAgent

INTERVAL = float(__import__("os").getenv("AGENT_INTERVAL", "12"))


def run():
    agent = BaseAgent("agent-data-analyst")
    agent.logger.info("Starting data analyst agent")

    while True:
        try:
            # Read metrics for dashboard
            agent.get("/api/metrics")
            time.sleep(3)

            # Read anonymized data (this is allowed)
            agent.get("/api/tools/read_anonymized_data")
            time.sleep(3)

            # Read metrics
            agent.get("/api/tools/read_metrics")

            time.sleep(INTERVAL)
        except Exception as e:
            agent.logger.error(f"Error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    run()
