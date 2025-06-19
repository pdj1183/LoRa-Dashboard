ARG PYTHON_VERSION=3.11

FROM python:${PYTHON_VERSION}-slim

WORKDIR /app

# Install any system dependencies (if needed)
RUN apt-get update && apt-get install -y curl

# Install Python dependencies — optional, edit as needed
COPY ./requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

