# Kubernetes

This project has support to be hosted on a kubernetes cluster, through the files in this directory and also <i>gitlab-ci.yml</i> in the root of the project. It does this by accessing the docker images of the frontend and backend built in the build stage (in gitlab-ci.yml).

## Run on own cluster

If this project was to be run on another cluster than the one in this project, there are a few steps:

-   Change values of <i>LIU_PROJECT_HOST</i> and <i>POD_NAMESPACE</i> variables located at the top of gitlab-ci.yml.
-   Update host value in <i>ingress.yml</i>

You could even change the docker registry if you would like. Currently the images are stored and fetched from docker hub. This can also be changed at the top of <i>gitlab-ci.yml</i>.
