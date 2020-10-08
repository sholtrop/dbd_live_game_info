FROM node:13.7.0-alpine

WORKDIR /frontend
COPY package.json /frontend
COPY yarn.lock /frontend
RUN ["yarn", "install"]
RUN ["yarn", "global", "add", "cross-env"]
COPY . /frontend
EXPOSE 8080
CMD ["yarn", "start"]
