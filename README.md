# nakniki-web-server

_Avi Ben David, Eden Shaked, Kfir Eitan._

This is the web server of the Netflix project.

## Important links

* [GitHub (This repo)](https://github.com/Roky360/nakniki-web-server)
* [GitHub (C++ Recommendation server)](https://github.com/Roky360/project-netflix)
* [Jira](https://edenshkd.atlassian.net/jira/software/projects/NP/boards/2/backlog)

---

## How to run

1. To run the web server, **Docker Desktop** and **MongoDB server** are required.  Also, clone the repo using:
    ```
    git clone https://github.com/Roky360/nakniki-web-server.git
    ```
   
2. Run **MongoDB server**, and our **recommendation server** using the instructions in [the repo](https://github.com/Roky360/project-netflix).

3. **Setup env file:**

    In the config directory there is an example env file with the required variables that the app needs. 
    Fill the variables with appropriate values and make sure that the NODE_ENV value is the same as the env file name (default is "example").
    
    **Notes:**
    - Ensure that in every URL you specify in the env file that uses `localhost`, write `host.docker.internal` instead to make sure docker can actually access localhost.
      For example: instead of `localhost:12345` write `host.docker.internal:12345`.
    - The MONGODB_URI is MongoDB connection string **with the database name at the end**. For example: `mongodb://host.docker.internal:27017/my_db`
    - PORT is the port that the web server will run on.
    - RECOM_URL is the recommendation server url. Note that by default we set it to run on port 20200, so a valid URL may be: `host.docker.internal:20200`.
    
4. **Run with docker:** run the following command to run the web server, with specifying the path to the env file you just set up, for example:
    ```bash
    docker-compose --env-file ./config/.env.example up app
    ```

**Now you can start sending requests to the web server using the guide below.**

## RESTful API guide

...
