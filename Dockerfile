# -------- Build --------
FROM node:20-alpine AS build

WORKDIR /app

# Recebe a variável em tempo de build
ARG VITE_API_URL=https://gestaoquadrangular-backend.onrender.com
ENV VITE_API_URL=$VITE_API_URL

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build


# -------- Runtime --------
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
