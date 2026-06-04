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
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
