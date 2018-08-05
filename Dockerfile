FROM node:10-alpine
WORKDIR /
ADD . /
RUN npm i
EXPOSE 80
ENV PORT=80
CMD ["npm", "start"]