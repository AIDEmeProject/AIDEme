FROM python:3.7.11-slim

# Create work directory
WORKDIR /app/api

# Install Git and GCC
RUN apt-get update && apt-get install -y git gcc

# Install Python dependencies
COPY requirements/base.txt requirements.txt
RUN pip3 install -r requirements.txt

# Start Flask server
COPY src/ src/
ENV FLASK_APP=src
ENV FLASK_ENV=development
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=5000"]
