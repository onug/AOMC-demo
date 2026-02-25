"""Partner API Agent — periodically reads public data from the external domain."""

import time

from base_agent import BaseAgent

INTERVAL = float(__import__("os").getenv("AGENT_INTERVAL", "15"))


def run():
    agent = BaseAgent("agent-partner-api")
    agent.logger.info("Starting partner API agent")

    while True:
        try:
            # Read public data
            agent.get("/api/tools/read_public_data")
            time.sleep(5)

            # Read public customer info
            agent.get("/api/customers/public")

            time.sleep(INTERVAL)
        except Exception as e:
            agent.logger.error(f"Error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    run()
