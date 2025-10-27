"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Enable CORS and security setup
app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  })
);

// Support JSON and URL encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.DB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Serve index and static files
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.use(express.static(__dirname));

// Favicon fix (optional)
app.get("/favicon.ico", (req, res) => res.status(204).end());

// API routes
require("./api.js")(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));

module.exports = app;

// 'use strict';
// require('dotenv').config();
// const express = require('express');
// const helmet = require('helmet');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();

// // Enable CORS and security setup
// app.use(cors());
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       "default-src": ["'self'"],
//       "script-src": ["'self'"],
//       "style-src": ["'self'"],
//     },
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Database connection
// mongoose
//   .connect(process.env.DB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection failed:", err));

// // Serve static files if testing locally
// app.use(express.static('public'));

// // Routes
// require('./api.js')(app);

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`App listening on port ${PORT}`));

// module.exports = app;

// 'use strict';
// require('dotenv').config({ path: 'sample.env' }); // This line loads variables from sample.env into process.env

// // Then you can access your environment variables like this:
// const DB = process.env.DB;

// // Now you can use the DB variable in your application.

// const express     = require('express');
// const bodyParser  = require('body-parser');
// const cors        = require('cors');

// const apiRoutes         = require('./routes/api.js');
// const fccTestingRoutes  = require('./routes/fcctesting.js');
// const runner            = require('./test-runner');
// const helmet = require("helmet");
// require("./db-connection");

// const app = express();

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "https://code.jquery.com/jquery-2.2.1.min.js"],
//       styleSrc: ["'self'"],
//     },
//   })
// );

// app.use('/public', express.static(process.cwd() + '/public'));

// app.use(cors({origin: '*'})); //For FCC testing purposes only

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// //Index page (static HTML)
// app.route('/')
//   .get(function (req, res) {
//     res.sendFile(process.cwd() + '/views/index.html');
//   });

// //For FCC testing purposes
// fccTestingRoutes(app);

// //Routing for API
// apiRoutes(app);

// //404 Not Found Middleware
// app.use(function(req, res, next) {
//   res.status(404)
//     .type('text')
//     .send('Not Found');
// });

// //Start our server and tests!
// const listener = app.listen(process.env.PORT || 3000, function () {
//   console.log('Your app is listening on port ' + listener.address().port);
//   if(process.env.NODE_ENV==='test') {
//     console.log('Running Tests...');
//     setTimeout(function () {
//       try {
//         runner.run();
//       } catch(e) {
//         console.log('Tests are not valid:');
//         console.error(e);
//       }
//     }, 3500);
//   }
// });

// module.exports = app; //for testing
