# Claims Management System  - Data Management Portal
* Claims Management System is a platform used to create, read, update delete, and manage claims. This is the user interface that connects to the api.

# Instructions
1. Navigate to your desired folder(it should be blank), or create a new folder for this project (i.e. cmp-dmp)
2. cd into the folder: `cd cmp-dmp`
3. Clone the repo into this folder: `git clone https://github.com/carlngan/cmp-dmp .`
4. `npm install` or `sudo npm install`
5. `bower install`
6. Make a file called ".env" -- `vim .env`
7. Paste the following content:
```

EXPRESS_SECRET=CARL
NODE_ENV=development
PORT=3002

```
8. `npm start`

9.  Follow the instructions to start the api here: https://github.com/carlngan/cmp-api

10.  You can test locally by opening "localhost:3002"

# Project in production
http://dmp.cmp.carlngan.com