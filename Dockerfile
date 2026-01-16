FROM node:16-bullseye
#It specifies the working directory of Docker file ,this is where the npm install will run 
WORKDIR /app
#It copies the package.json and package-lock.json to the working directory
COPY  package*.json ./
#It runs npm install to install the dependencies specified in package.json
RUN npm install
#It copy everything into image
COPY . .
EXPOSE 3002
#It specifies the command to run the application
CMD [ "npm", "run", "start" ]

