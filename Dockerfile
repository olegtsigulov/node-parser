FROM node:13

RUN mkdir -p /usr/src/node-parser/
WORKDIR /usr/src/node-parser/

COPY . /usr/src/node-parser/package.json
RUN npm install

COPY . /usr/src/node-parser/

CMD ["node", "bin/service.js"]
