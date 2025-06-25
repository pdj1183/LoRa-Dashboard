FROM python:3.13

WORKDIR /app

# Install debug tools (optional)
RUN apt-get update && apt-get install -y \
    iputils-ping \
    dnsutils \
    netcat-openbsd \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy ONLY the app folder (so /app/app/ exists as expected)
COPY app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

