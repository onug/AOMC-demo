"""Data Loss Prevention — regex-based PII/PCI scanner for data guardrails."""

import re

# Patterns for sensitive data
PATTERNS = {
    "SSN": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "CREDIT_CARD": re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b"),
    "EMAIL_PII": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
}

REDACTION = "[REDACTED]"


def scan(text: str) -> list[dict]:
    """Scan text for PII/PCI patterns. Returns list of findings."""
    findings = []
    for name, pattern in PATTERNS.items():
        matches = pattern.findall(text)
        if matches:
            findings.append({"type": name, "count": len(matches)})
    return findings


def redact(text: str) -> str:
    """Redact all PII/PCI patterns from text."""
    result = text
    for pattern in PATTERNS.values():
        result = pattern.sub(REDACTION, result)
    return result
