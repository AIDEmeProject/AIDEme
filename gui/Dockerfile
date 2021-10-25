FROM node:16.10-slim

# Create work directory
WORKDIR /app/gui

# Install dependencies
COPY package*.json ./
RUN npm install

# Start Flask server
COPY src/ src/
COPY public/ public/
CMD [ "npm", "start"]
