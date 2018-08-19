FROM node:10-alpine
ARG NOW_URL
ARG NOW
ARG NOW_DC
WORKDIR /server/:src
#ADD . /
RUN npm i
EXPOSE 80
ENV PORT=80
ENV NOW_URL=${NOW_URL}
CMD ["npm", "start"]