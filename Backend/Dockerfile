# Step 1: Build the application
FROM python:3.10-slim AS build

# Set environment variables
ENV POETRY_VERSION=1.6.1 

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry==$POETRY_VERSION

# Ensure Poetry is in the PATH
ENV PATH="/root/.local/bin:$PATH"

# Set the working directory
WORKDIR /app

# Copy the dependency files
COPY pyproject.toml poetry.lock ./

# Disable virtualenv creation and install dependencies globally
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# Copy the rest of the application code
COPY . .

# Step 2: Final image
FROM python:3.10-slim

# Set environment variables
ENV PATH="/root/.local/bin:$PATH"

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the installed dependencies and application code from the build stage
COPY --from=build /app /app

# Expose the port your application will run on
EXPOSE 80

# Command to run the application using Gunicorn
CMD ["poetry", "run", "gunicorn", "-w", "4", "-b", "0.0.0.0:80", "server:app"]