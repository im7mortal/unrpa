# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    firefox-esr \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install GeckoDriver
RUN wget -q -O - https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz | tar xzf - -C /usr/local/bin

# Install Python packages
RUN pip install selenium


# Command to run the script
CMD ["python", "/app/screenshot.py"]