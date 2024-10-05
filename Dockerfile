FROM ghcr.io/puppeteer/puppeteer

ARG APP_PORT
WORKDIR /app
COPY package.json ./
RUN npm i;
COPY . .
ENV APP_PORT=$APP_PORT
EXPOSE $APP_PORT
CMD ["node", "index.js"]