"""Base agent class — HTTP client that routes all requests through the AOMC gateway."""

import os
import time
import json
import logging

import httpx

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://aomc-gateway:8080")
AGENT_MODE = os.getenv("AGENT_MODE", "scripted")  # "scripted" or "llm"


class BaseAgent:
    def __init__(self, agent_id: str, cert_cn: str | None = None):
        self.agent_id = agent_id
        self.cert_cn = cert_cn or agent_id
        self.logger = logging.getLogger(agent_id)
        self._client: httpx.Client | None = None

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            self._client = httpx.Client(
                base_url=GATEWAY_URL,
                timeout=10.0,
                headers={
                    "X-Agent-ID": self.agent_id,
                    "X-Agent-Cert-CN": self.cert_cn,
                },
            )
        return self._client

    def get(self, path: str, target_agent: str = "", **kwargs) -> httpx.Response:
        client = self._get_client()
        headers = kwargs.pop("headers", {})
        if target_agent:
            headers["X-Target-Agent"] = target_agent
        self.logger.info(f"GET {path}")
        try:
            resp = client.get(path, headers=headers, **kwargs)
            self.logger.info(f"  -> {resp.status_code}")
            return resp
        except Exception as e:
            self.logger.error(f"  -> ERROR: {e}")
            raise

    def post(self, path: str, target_agent: str = "", **kwargs) -> httpx.Response:
        client = self._get_client()
        headers = kwargs.pop("headers", {})
        if target_agent:
            headers["X-Target-Agent"] = target_agent
        self.logger.info(f"POST {path}")
        try:
            resp = client.post(path, headers=headers, **kwargs)
            self.logger.info(f"  -> {resp.status_code}")
            return resp
        except Exception as e:
            self.logger.error(f"  -> ERROR: {e}")
            raise

    def close(self):
        if self._client:
            self._client.close()

    def sleep(self, seconds: float):
        time.sleep(seconds)
