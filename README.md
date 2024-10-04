# Running the Frontend and Backend with only one terminal

This project uses `concurrently` to run both the frontend and backend simultaneously from a single terminal.

## Prerequisites

- Make sure Poetry is installed. Follow the installation instructions in /Backend/README.md.
- Run this in the /Backend directory

```bash
poetry install
```

- Make sure you have Node and npm installed on you system.
- Run this in the /Frontend directory

```bash
npm install
```

## Setup

Install the Concurrently dependency in the project root.

```bash
npm install
```

Start the whole project (both Frontend and Backend) by running this single command

```bash
npm start
```

If you encounter errors. Make sure you have followed the Prerequisites.

