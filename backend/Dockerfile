FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

ENV FLASK_HOST=0.0.0.0
ENV FLASK_PORT=5001
ENV FLASK_DEBUG=true

CMD ["python", "app.py"]
