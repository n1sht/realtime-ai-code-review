FROM node:20-alpine AS server
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev
COPY server/ .
EXPOSE 3001
CMD ["node", "server.js"]

FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm ci
COPY client/ .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS client
WORKDIR /app/client
COPY --from=client-build /app/client/.next/standalone ./
COPY --from=client-build /app/client/.next/static ./.next/static
COPY --from=client-build /app/client/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
