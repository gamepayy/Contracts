FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .
CMD ["yarn", "hardhat", "run", "scripts/merkleTree.ts", "--network", "mumbai"]