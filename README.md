# Setup
Run the following to install dependencies, setup '.env' file and start the server:
```
npm install
npm run setup
npm start
```
If you want to declare your own environment variables do not run `npm run setup`.  
Declare the following environment variables.
```
IP="The IP address the server listens to"
PORT=443 for HTTPS, the port the server listens to.
SECRET_TOKEN="Some string used to hash and validate JSON web tokens"
SECRET_COOKIE="Some string used to sign cookies"
```
