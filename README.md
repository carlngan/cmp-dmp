# Claims Management System  - Data Management Portal
* Claims Management System is a platform used to create, read, update delete, and manage claims. This is the user interface that connects to the api.

# Instructions
1. Navigate to your desired folder(it should be blank), or create a new folder for this project (i.e. cmp-dmp)
3. cd into the folder: `cd cmp-dmp`
4. Clone the repo into this folder: `git clone https://github.com/carlngan/cmp-dmp .`
5. `npm install` or `sudo npm install`
6. `bower install`
7. Make a file called ".env" -- `vim .env`
8. Paste the following content:
```

EXPRESS_SECRET=CARL
NODE_ENV=development
PORT=3002

```
9. `npm start`

10.  Follow the instructions to start the api here: https://github.com/carlngan/cmp-api

11.  You can test locally by opening "localhost:3002"

# Project in production
http://dmp.cmp.carlngan.com