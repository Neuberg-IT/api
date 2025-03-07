# Use Node.js official image
FROM node:18-alpine

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app listens on
EXPOSE 2096

# Command to run the app
CMD ["node", "index.js"]
