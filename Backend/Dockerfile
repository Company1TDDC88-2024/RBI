# Step 1: Build the application
FROM python:3.10 AS build

# Set environment variables
ENV POETRY_VERSION=1.6.1
ENV PYTHONUNBUFFERED=1
ENV ACCEPT_EULA=Y
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc unixodbc-dev curl apt-transport-https gnupg

# Download and install the ODBC driver manually
RUN curl -O https://packages.microsoft.com/debian/11/prod/pool/main/m/msodbcsql18/msodbcsql18_18.2.2.1-1_amd64.deb \
    && apt-get install -y ./msodbcsql18_18.2.2.1-1_amd64.deb \
    && rm msodbcsql18_18.2.2.1-1_amd64.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir "poetry==1.6.1"

# Ensure Poetry is in the PATH
ENV PATH="/root/.local/bin:$PATH"

# Set the working directory
WORKDIR /app

# Create the global virtualenvs directory and configure Poetry to use it
RUN mkdir -p /root/.cache/pypoetry/virtualenvs \
    && poetry config virtualenvs.path /root/.cache/pypoetry/virtualenvs

# Copy the dependency files
COPY pyproject.toml poetry.lock ./

# Enable virtualenv creation and install dependencies
RUN poetry config virtualenvs.create true \
    && poetry install --no-dev --no-interaction --no-ansi

# Copy the rest of the application code
COPY . .

# Step 2: Run the application
FROM python:3.10

# Set environment variables
ENV PATH="/root/.local/bin:$PATH"
ENV ACCEPT_EULA=Y
ENV DEBIAN_FRONTEND=noninteractive
ENV DEPLOYMENT=True
ENV BACKEND_URL=https://tddc88-company1-ht24.kubernetes-public.it.liu.se/api

# Set the working directory
WORKDIR /app

# Copy only the installed dependencies and application from the build stage
COPY --from=build /app /app
COPY --from=build /root/.cache/pypoetry /root/.cache/pypoetry

# Install system dependencies and ODBC driver
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc unixodbc curl apt-transport-https gnupg \
    && curl -O https://packages.microsoft.com/debian/11/prod/pool/main/m/msodbcsql18/msodbcsql18_18.2.2.1-1_amd64.deb \
    && apt-get install -y ./msodbcsql18_18.2.2.1-1_amd64.deb \
    && rm msodbcsql18_18.2.2.1-1_amd64.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable for Flask
ENV FLASK_APP=server.py
ENV PYTHONUNBUFFERED=1

# Expose the port your application runs on
EXPOSE 80

# Command to run the application using poetry
CMD ["/root/.cache/pypoetry/virtualenvs/backend-9TtSrW0h-py3.10/bin/python", "-m", "flask", "run", "--host=0.0.0.0", "--port=80"]