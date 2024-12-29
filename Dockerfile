FROM node:latest
LABEL authors="Avi Eden Kfir"
LABEL version=0.1

WORKDIR /app

# copy project files
COPY package*.json .
COPY ./src ./src
COPY ./config ./config

# install dependencies
RUN npm install

CMD ["npm", "start"]
