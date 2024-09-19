# Basics about the frontend

The frontend is a React application using Typescript and Vite.
Reason for using Vite is its fast optimization compared to a standard react project and HMR, making changes appear directly when saving a file.

## Running the project

When running the frontend for the first time, you will need install all dependencies for this react app.

```bash
npm install
```

There after you can start the react application by running

```bash
npm start
```

If someone else installs a package and the dependencies has been updated since you last were in main, you will need to install those dependencies with npm install aswell. You do not however need to specify which dependencies you want to install, as the command will handle that for you, and just install the missing dependencies. So if you are switching to the main branch, run npm start, and you get some errors, try npm install first and then npm start.
