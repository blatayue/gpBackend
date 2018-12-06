# escape=`
FROM node:10-alpine
ARG NOW_URL
ARG NOW
ARG NOW_DC

# RUN apk add --no-cache make gcc g++ python cairo-dev build-base
COPY . /server/
WORKDIR /server/
RUN npm ci
RUN npm run build
EXPOSE 80
ENV PORT=80
ENV NOW_URL=${NOW_URL}
CMD npm start