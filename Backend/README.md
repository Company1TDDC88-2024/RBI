# Basics about the backend

This backend uses python and the flask (micro)framework. It also uses Poetry, a dependency manager for python.
The reason for using Poetry is to remove the need for developers to create special environments when developing, and also remove the need to tasks of handling different versions of dependencies between systems. All of this, Poetry will handle for you.

## Setting up Poetry

In order to run the project, you will need to have Poetry installed. This installation will differ depending on your OS.

### Mac

First you will need to install Poetry by running this command

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

After that you will need to add the path to Poetrys BIN folder

```bash
nano ~/.zshrc
```

```bash
export PATH="$HOME/.local/bin:$PATH"
```

-   [Save and close using (Ctrl+O then Ctrl+X)]

```bash
source ~/.zshrc
```

After this, you can see if it worked by running

```bash
poetry --version
```

### Windows

First install Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

---

When installing here, be cautious if you get an warning in the lines of Poetry tried to install at target location "c/.../" but instead installed at location "c/.../"

In case you get this error, it's likely because you have an installed python version from Microsoft. This will generate some issues when trying to use Poetry. In order to fix this, you will need to uninstall all versions of Python on your PC and then reinstall. This can be done by going into

-   Settings > Apps > Installed apps
-   Search for python and delete every python installation
-   Go to pythons official website and download it again (or open the python installer if you still have it on your computer).
-   In the install, make sure you include adding it to Path
-   Try to install Poetry again with the command from above

---

After Poetry is installed, you want to add the path to the Poetry script file into your environment variables. This path should be displayed in the terminal when you have installed Poetry. To do so

-   Open _Environment Variables_
-   You will then want to click on _Path_ in Environment variables for <user>
-   Click on _New_ and paste in the path

To insure everything is correct, try typing this command and see if it displays a version (you might need to close and reopen the terminal)

```bash
poetry --version
```

If you don't get an error, it works!

## Running the server

Poetry functions similarily to npm. When we want to install a new dependency we use

```bash
poetry add <dependency>
```

But don't use this command to install all sort of dependencies, see and discuss with the team if that dependency is really necessary before you add it to the project.

If we don't want to install a new dependency, and just want to run the project. We will firstly run

```bash
poetry install
```

This command will install all the dependencies in the `pyproject.toml` file, just like how npm install works. This has to be run the first time you want to run the backend (or everytime you reinstall poetry or create a new venv manually). You will also need to run this file if someone else in the project has installed a dependency on a branch, that you dont have. For example, if you are going into main after you are done with working in your own branch, and someone has installed a new dependency on main, you will then need to run poetry install. If you are unsure, just try to run the backend. If you get an error, then there might be a new dependeny to install.

To actually run the server, we use this command

```bash
poetry run flask --app server run
```

If you do any changes in the backend, you will need to stop your server and start it again using this command, unlike the react project where HMR fixes that issue. Right now we don't have a fix for this on the backend.
