FROM python:3.12

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir opencv-python-headless==4.10.0.84

COPY create_video_from_screenshots.py .

#CMD ["ls", "-l", "/screenshots"]
CMD ["python", "-u", "create_video_from_screenshots.py"]
