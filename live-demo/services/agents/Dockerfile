FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Rogue agent needs FastAPI + uvicorn for its HTTP trigger
RUN pip install --no-cache-dir fastapi uvicorn[standard]

COPY . .

# Default: run the agent script specified by AGENT_SCRIPT env var
# Use shell form so $AGENT_SCRIPT is expanded
CMD python -u $AGENT_SCRIPT
