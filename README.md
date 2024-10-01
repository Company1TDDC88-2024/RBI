# Running the Frontend and Backend with only one terminal

This project uses `concurrently` to run both the frontend and backend simultaneously from a single terminal.

## Prerequisites

- Follow the installation instructions in /Backend/README.md and make sure poetry and all dependencies are installed in the Backend root.
- Follow the installation instructions in /Frontend/README.md and make sure all dependencies are installed in the Frontend root.

## Setup

Install Concurrently in the project root.

```bash
npm install
```

Start the whole project (both Frontend and Backend) by running this single command

```bash
npm start
```

If you encounter errors. Make sure you have followed the Prerequisites.

