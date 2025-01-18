FROM python:3.12-slim

# Update pip to the latest version
RUN pip install --upgrade pip

# Install required system packages
RUN apt update && apt install -y --no-install-recommends \
    gcc \
    musl-dev \
    sqlite3 \
    curl \
    ffmpeg \
    && apt clean && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code into the image
COPY . /app

# Set the working directory
WORKDIR /app

# Expose the application port
EXPOSE 8000

# Run entrypoint.sh
COPY --chown==755 ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Start the backend server
CMD ["/entrypoint.sh"]
