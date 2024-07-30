# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    firefox-esr \
    xvfb \
    gnupg \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-noto-extra \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN wget -q -O /usr/local/bin/chromedriver http://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_linux64.zip

# Install GeckoDriver
RUN wget -q -O - https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz | tar xzf - -C /usr/local/bin

# Install Python packages
RUN pip install selenium

# Command to run the script
CMD ["python", "-u", "/app/screenshot.py"]
