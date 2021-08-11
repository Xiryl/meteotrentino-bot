FROM node:12.13.0-alpine

# install dependencies
WORKDIR /opt/app
COPY package.json package-lock.json* ./
RUN rm -rf node_modules && npm cache clean --force && npm install --production

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY . /opt/app


CMD [ "npm", "run", "start" ]