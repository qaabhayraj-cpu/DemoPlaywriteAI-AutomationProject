FROM mcr.microsoft.com/playwright:v1.57.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx playwright install --with-deps
ENV CI=true
ENV HEADLESS=true
CMD ["npx", "playwright", "test"]
