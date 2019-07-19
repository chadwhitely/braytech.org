# Braytech

_The source code of braytech.org_

## Development

Before you can build this project, you must install and configure one of the following dependencies on your machine:

1. [Node.js](https://nodejs.org): We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

   After installing Node, you should be able to run the following command to install development tools. You will only need to run this command when dependencies change in [package.json](package.json).

       npm install

    To start the app running on the default port of 3000 run:

       npm start

    The `npm run` command will list all of the scripts available to run for this project.

1. [Docker](https://www.docker.com/products/docker-desktop): Docker can encapsulate and install all the dependencies, ensuring a consistent development environment across systems.

   Once Docker has been installed, run the following to build the image:

       docker build --rm -f "braytech.org/dockerfile" -t braytech.org:latest braytech.org

   Then you may execute the following to run the app, mapping the files into the container as well:

       docker run --rm -v /path/to/git/repo/src:/usr/src/app/src -p 3000:3000/tcp braytech.org:latest

### API Key

You will need to create an api key for bungie.net by applying at https://www.bungie.net/en/Application . It will require the following pieces of information:

- Application name: anything you'd like
- Website: can be blank
- OAuth client type: confidential
- Redirect URL: your URL, localhost:3000 by default
- No scopes needed
- Origin header: similar to the Redirect URL, http://localhost:3000 by default

Once created, copy all relevant fields to .env.development and refresh your environment.

© Bungie, Inc. All rights reserved. Destiny, the Destiny Logo, Bungie and the Bungie logo are among the trademarks of Bungie, Inc.
