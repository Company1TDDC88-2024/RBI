# Use the official Python image with the appropriate version
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy the requirements file (if you have one)
# Create a requirements.txt with Flask if you haven't already
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port that Flask will run on
EXPOSE 5001

# Set environment variables to allow Flask to run in production
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV BACKEND_URL=https://tddc88-company1-ht24.kubernetes-public.it.liu.se/api

# Run the Flask application
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]