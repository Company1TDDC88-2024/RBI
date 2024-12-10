# Proxy

This project uses a proxy which is intended to run locally at the store of the customer. The Proxy requires some manual configuration with specifying the IP-addresses of the cameras & speakers, along with some additional information. This data should reside in a .env file in the root of /proxy directory by assigning values to these keys:

<i>BACKEND_URL = http://xxxx:port<br />
CAMERA1_URL = http://ip-address/axis-cgi/mjpg/video.cgi<br />
CAMERA1_USERNAME = xxxx<br />
CAMERA1_PASSWORD = xxxx<br />
CAMERA2_URL = http://ip-address/axis-cgi/mjpg/video.cgi<br />
CAMERA2_USERNAME = xxxx<br />
CAMERA2_PASSWORD = xxxx<br />
SPEAKER_URL = http://ip-adress/axis-cgi/mediaclip.cgi?action=play&clip=<br />
SPEAKER_USERNAME = xxxx<br />
SPEAKER_PASSWORD = xxxx</i>

## Setup

The first thing needed is to install all the packages which are used by the Proxy. This is done by running this command in the terminal while instead the Proxy directory (/Proxy).

```bash
pip install
```

After that you can run the proxy by running:

```bash
py proxy.py
```

## Configuring the proxy for the customer

After configuring the environment variables there is one more step required. That is to set up portforwarding on the router to forward incoming requests to the proxy server. If you are unsure on how to do this, visit your router manufactorers documentation.

Portforwards should be pointed to the IP adress of the device running the proxy with port 4000 specified. Example:

<i>192.0.0.100:4000</i>.
