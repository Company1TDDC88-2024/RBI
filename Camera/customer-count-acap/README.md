## Introduction

This is a modification of the README file found at https://github.com/AxisCommunications/acap-native-sdk-examples/blob/main/message-broker/consume-scene-metadata/README.md.

## Getting started

These instructions will guide you on how to execute the code. Below is the
structure and scripts used in the example:

```sh
customer-count-acap
├── app
│   ├── LICENSE
│   ├── Makefile
│   ├── manifest.json
│   └── customer_count_acap.c
├── Dockerfile
└── README.md
```

- **app/LICENSE** - Text file which lists all open source licensed source code distributed with the application.
- **app/Makefile** - Makefile containing the build and link instructions for building the ACAP application.
- **app/manifest.json** - Defines the application and its configuration.
- **app/customer_count_acap.c** - Application source code.
- **Dockerfile** - Dockerfile with the specified Axis toolchain and API container to build the example specified.
- **README.md** - Step by step instructions on how to run the example.

### How to run the code

Below is the step by step instructions on how to execute the program. So
basically starting with the generation of the .eap file to running it on a
device:

#### Build the application

Standing in the customer-count-acap folder, run the following command:

```sh
docker build --build-arg ARCH=<ARCH> --tag customer-count-acap .
```

- `<ARCH>` is the SDK architecture, `armv7hf` or `aarch64`.

For Windows computers, then run:

```sh
docker run -it customer-count-acap
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

## Example of input data for the application

Example 1:
{
    "duration": 0.1,
    "end_time": "2024-10-09T14:40:32.979682Z",
    "id": "760c0eda-a96f-4740-9f59-d59966a5d7cd",
    "observations": [
        {
            "bounding_box": {
                "bottom": 0.7704,
                "left": 0.4384,
                "right": 0.4847,
                "top": 0.611
            },
            "timestamp": "2024-10-09T14:40:32.879682Z"
        },
        {
            "bounding_box": {
                "bottom": 0.7938,
                "left": 0.4285,
                "right": 0.4866,
                "top": 0.6031
            },
            "timestamp": "2024-10-09T14:40:32.979681Z"
        }
    ],
    "start_time": "2024-10-09T14:40:32.879682Z"
}

Example 2:
{
    "classes": [
        {
            "score": 0.9156,
            "type": "Face"
        }
    ],
    "duration": 1.5,
    "end_time": "2024-10-09T14:40:31.379698Z",
    "id": "c4e85799-121d-43ee-be5e-75fe537ad009",
    "observations": [
        {
            "bounding_box": {
                "bottom": 0.6328,
                "left": 0.6707,
                "right": 0.7548,
                "top": 0.417
            },
            "timestamp": "2024-10-09T14:40:29.879711Z"
        },
        {
            "bounding_box": {
                "bottom": 0.6558,
                "left": 0.8592,
                "right": 0.9599,
                "top": 0.3932
            },
            "timestamp": "2024-10-09T14:40:31.379697Z"
        }
    ],
    "start_time": "2024-10-09T14:40:29.879711Z"
}

Example 3:
{
    "classes": [
        {
            "lower_clothing_colors": [
                {
                    "name": "Blue",
                    "score": 0.3496
                },
                {
                    "name": "Black",
                    "score": 0.31
                },
                {
                    "name": "Gray",
                    "score": 0.2364
                },
                {
                    "name": "Beige",
                    "score": 0.1716
                },
                {
                    "name": "White",
                    "score": 0.1708
                },
                {
                    "name": "Green",
                    "score": 0.124
                },
                {
                    "name": "Red",
                    "score": 0.094
                }
            ],
            "score": 0.5952,
            "type": "Human",
            "upper_clothing_colors": [
                {
                    "name": "Blue",
                    "score": 0.4176
                },
                {
                    "name": "Gray",
                    "score": 0.34
                },
                {
                    "name": "Black",
                    "score": 0.2888
                },
                {
                    "name": "White",
                    "score": 0.2404
                },
                {
                    "name": "Beige",
                    "score": 0.1436
                },
                {
                    "name": "Red",
                    "score": 0.142
                },
                {
                    "name": "Green",
                    "score": 0.1292
                },
                {
                    "name": "Yellow",
                    "score": 0.0488
                }
            ]
        }
    ],
    "duration": 9.7999,
    "end_time": "2024-10-09T14:40:24.579761Z",
    "id": "d90590ee-b057-4180-b800-9788b36454b6",
    "observations": [
        {
            "bounding_box": {
                "bottom": 0.8949,
                "left": 0.7166,
                "right": 0.7378,
                "top": 0.8693
            },
            "timestamp": "2024-10-09T14:40:14.779854Z"
        },
        {
            "bounding_box": {
                "bottom": 0.8933,
                "left": 0.7157,
                "right": 0.736,
                "top": 0.8662
            },
            "timestamp": "2024-10-09T14:40:14.879853Z"
        }
    ],
    "start_time": "2024-10-09T14:40:14.779855Z"
}

## Example of output data for the application

{
    "human_id": "5b8b4da4-bd35-41e6-b4d3-564b761727d7",
    "observations": [
        {
            "bounding_box": {
                "bottom": 0.9983,
                "left": 0.5255,
                "right": 0.5482,
                "top": 0.8974
            },
            "timestamp": "2024-05-13T15:21:39.889602Z"
        },
        {
            "bounding_box": {
                "bottom": 0.9983,
                "left": 0.5249,
                "right": 0.5469,
                "top": 0.8954
            },
            "timestamp": "2024-05-13T15:21:39.986261Z"
        }
    ]    
}