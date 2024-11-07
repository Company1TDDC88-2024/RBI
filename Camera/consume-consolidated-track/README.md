## Introduction

This is a modified README file based on the README file in consume-analytics-scene-description folder.

## Getting started

These instructions will guide you on how to execute the code. Below is the
structure and scripts used in the example:

```sh
consume-consolidated-track
├── app
│   ├── LICENSE
│   ├── Makefile
│   ├── manifest.json
│   └── consolidated_data_app.c
├── Dockerfile
└── README.md
```

- **app/LICENSE** - Text file which lists all open source licensed source code distributed with the application.
- **app/Makefile** - Makefile containing the build and link instructions for building the ACAP application.
- **app/manifest.json** - Defines the application and its configuration.
- **app/consolidated_data_app.c** - Application source code.
- **Dockerfile** - Dockerfile with the specified Axis toolchain and API container to build the example specified.
- **README.md** - Step by step instructions on how to run the example.

### How to run the code

Below is the step by step instructions on how to execute the program. So
basically starting with the generation of the .eap file to running it on a
device:

#### Build the application

Standing in the consume-consolidated-track folder, run the following command:

```sh
docker build --build-arg ARCH=<ARCH> --tag consolidated-data-app .
```

- `<ARCH>` is the SDK architecture, `armv7hf` or `aarch64`.

For Windows computers, then run:

```sh
docker run -it consolidated-data-app
docker cp <CONTAINER_ID>:/opt/app ./build
```

- `<CONTAINER_ID>` is the container's ID found in the Docker application, for example `fa3700ed520f0c585064e0e9182e7cc7dbe40fad8e1154496e517742a0baf25d`.

For other computers, instead run:

```sh
docker cp $(docker create <APP_IMAGE>):/opt/app ./build
```

#### Install your application

Browse to the application page of the Axis device:

```sh
http://<AXIS_DEVICE_IP>/index.html#apps
```

- Click on the tab `App` in the device GUI
- Click `(+)` sign to upload the application file
- Browse to the newly built .eap file
- Click `Install`
- Run the application by enabling the `Start` switch