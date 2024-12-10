# Retail business intelligence

This project is a solution for Axis's request for an application of retail business intelligence. The project is a webapplication which is supposed to be hosted and used as a cloudbased system, making use of Axis's cameras and loudspeakers for input and output.

---

This project contains code for the:

-   Frontend
-   Backend
-   Proxy
-   Axis Camera (ACAP)

It also contains configurations for a k8s pipeline running the following jobs:

-   Build stage
-   Testing (Automatic unit and integration tests)
-   DB connectivity test
-   Pre-deployment (fetching k8s configurations)
-   Deploy
-   Status

More information on the specifics can be found in the <i>readme</i> files located in the following folders: <b>Frontend, Backend, Proxy and k8s</b>

## Prerequisites

In order to run the application locally you will need to install the dependencies used by the systems.

-   Make sure Poetry is installed. Follow the installation instructions in /Backend/README.md.

-   Run this in the /Backend directory

```bash

poetry  install

```

-   Make sure you have Node and npm installed on you system.

-   Run this in the /Frontend directory

```bash

npm  install

```

## Setup

The Frontend & Backend can be run concurrently, using the Concurrently package.

Install the Concurrently dependency in the project root.

```bash

npm  install

```

You can also start both the Frontend and Backend by running this single command in root.

```bash

npm  start

```

If you encounter errors, make sure you have followed the <i>Prerequisites</i>.
