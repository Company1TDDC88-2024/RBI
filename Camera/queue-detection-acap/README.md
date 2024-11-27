## Introduction

This is a modification of the README file found at https://github.com/AxisCommunications/acap-native-sdk-examples/blob/main/message-broker/consume-scene-metadata/README.md.

## Getting started

These instructions will guide you on how to execute the code. Below is the
structure and scripts used in the example:

```sh
queue-detection-acap
├── app
│   ├── LICENSE
│   ├── Makefile
│   ├── manifest.json
│   └── queue_detection_acap.c
├── Dockerfile
└── README.md
```

- **app/LICENSE** - Text file which lists all open source licensed source code distributed with the application.
- **app/Makefile** - Makefile containing the build and link instructions for building the ACAP application.
- **app/manifest.json** - Defines the application and its configuration.
- **app/queue_detection_acap.c** - Application source code.
- **Dockerfile** - Dockerfile with the specified Axis toolchain and API container to build the example specified.
- **README.md** - Step by step instructions on how to run the example.

### How to run the code

Below is the step by step instructions on how to execute the program. So
basically starting with the generation of the .eap file to running it on a
device:

#### Build the application

Standing in the queue-detection-acap folder, run the following command:

```sh
docker build --build-arg ARCH=<ARCH> --tag queue-detection-acap .
```

- `<ARCH>` is the SDK architecture, `armv7hf` or `aarch64`.

For Windows computers, then run:

```sh
docker run -it queue-detection-acap
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

## Expected ACAP inputs

Example 1:
{
    "frame": {
        "observations": [],
        "operations": [],
        "timestamp": "2024-10-09T15:15:26.659746Z"
    }
}

Example 2:
{
    "frame": {
        "observations": [
            {
                "bounding_box": {
                    "bottom": 0.9974,
                    "left": 0.661,
                    "right": 0.7878,
                    "top": 0.838
                },
                "timestamp": "2024-10-09T15:15:31.959696Z",
                "track_id": "16"
            }
        ],
        "operations": [],
        "timestamp": "2024-10-09T15:15:31.959696Z"
    }
}

Example 3:
{
    "frame": {
        "observations": [
            {
                "bounding_box": {
                    "bottom": 0.984,
                    "left": 0.6553,
                    "right": 0.814,
                    "top": 0.8039
                },
                "class": {
                    "lower_clothing_colors": [
                        {
                            "name": "Black",
                            "score": 0.25
                        }
                    ],
                    "score": 0.41,
                    "type": "Human",
                    "upper_clothing_colors": [
                        {
                            "name": "Black",
                            "score": 0.32
                        }
                    ]
                },
                "timestamp": "2024-10-09T15:15:32.159694Z",
                "track_id": "16"
            },
            {
                "bounding_box": {
                    "bottom": 0.9864,
                    "left": 0.6641,
                    "right": 0.7956,
                    "top": 0.8066
                },
                "class": {
                    "score": 0.61,
                    "type": "Face"
                },
                "timestamp": "2024-10-09T15:15:32.159694Z",
                "track_id": "17"
            }
        ],
        "operations": [],
        "timestamp": "2024-10-09T15:15:32.159694Z"
    }
}

## Expected ACAP outputs

Example 1:
{    
   "timestamp": "2024-02-14T15:37:21.040577Z",
   "camera_id": "1",
   "observations": [
      {
         "track_id": "25",
         "bounding_box": {
            "bottom": 0.7413,
            "left": 0.4396,
            "right": 0.7661,
            "top": 0.4234
         }
      },
      {
         "track_id": "26",
         "bounding_box": {
            "bottom": 0.9431,
            "left": 0.9656,
            "right": 0.9989,
            "top": 0.8365
         }
      }
   ]
}

Example 2:
{
   "timestamp": "2024-02-14T15:37:21.040577Z",
   "camera_id": "1",
   "observations": []
}