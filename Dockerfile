FROM node:20-alpine

# install dependencies
WORKDIR /opt/app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY . /opt/app


CMD [ "npm", "run", "start" ]