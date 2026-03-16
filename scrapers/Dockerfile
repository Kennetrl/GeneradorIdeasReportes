# ─────────────────────────────────────────────────────────────────────────────
# Scrapers - Data Collection
# ─────────────────────────────────────────────────────────────────────────────

# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# ─────────────────────────────────────────────────────────────────────────────
# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies for Playwright and other tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    ca-certificates \
    libxslt1.1 \
    libxml2 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Set PATH for user-installed packages
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Copy application code
COPY . .

# Create data directory for outputs
RUN mkdir -p /app/data

# Install Playwright browsers (required for dynamic scraping)
RUN python -m playwright install \
    && python -m playwright install-deps

# Expose volume for data
VOLUME ["/app/data"]

# Default command - can be overridden with arguments
CMD ["python", "main.py"]
