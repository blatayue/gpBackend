# escape=`
FROM node:10-alpine
ARG NOW_URL
ARG NOW
ARG NOW_DC
RUN apk add --no-cache make gcc g++ python cairo-dev
COPY . /server/src
WORKDIR /server/src
RUN npm ci
EXPOSE 80
ENV PORT=80
ENV NOW_URL=${NOW_URL}
CMD npm start