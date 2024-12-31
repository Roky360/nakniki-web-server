FROM node:latest
LABEL authors="Avi Eden Kfir"
LABEL version=0.1

WORKDIR /app

# copy project files
COPY package*.json .
COPY ./src ./src
COPY ./config ./config

# get the env name and set it for npm
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

# install dependencies
RUN npm install

# start app
CMD ["npm", "start"]
