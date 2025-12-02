FROM python:3.12-slim

# System deps (psycopg2 needs these)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend code and requirements
COPY backend/ ./backend/
COPY backend/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

# Expose FastAPI port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]
