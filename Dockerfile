FROM node:latest
LABEL authors="Avi Eden Kfir"
LABEL version=0.1

WORKDIR /app

# copy project files
COPY package*.json .
COPY src/ .
COPY config/ .

# install dependencies
RUN npm install --omit=dev

CMD ["npm", "start"]
