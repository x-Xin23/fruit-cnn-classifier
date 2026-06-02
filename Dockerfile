FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY api/requirements.txt ./api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

# Copy only what the backend needs
COPY api/ ./api/
COPY src/models/ ./src/models/
COPY src/utils/ ./src/utils/
COPY src/__init__.py ./src/__init__.py
COPY models/fruit_cnn.pth ./models/fruit_cnn.pth

EXPOSE 7860

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
