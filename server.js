'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

// These two files are required for the tests to run
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// --- Database Connection ---
mongoose
  .connect(process.env.DB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// --- Security (CSP) ---
// This is the correct policy for Test #2
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", "https://cdn.freecodecamp.org/"]
  }
}));

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app); // This loads your ./routes/api.js file

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run(); // This is the code that runs your tests
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; //for testing








// "use strict";

// require("dotenv").config();

// const express = require("express");
// const helmet = require("helmet");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");

// const app = express();

// // Enable CORS and security setup
// app.use(cors());

// // Allow images from self and freeCodeCamp favicon CDN
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'"],
//       imgSrc: ["'self'", "https://cdn.freecodecamp.org/"],
//     },
//   })
// );

// // Support JSON and URL encoding
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Connect to MongoDB
// mongoose
//   .connect(process.env.DB)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection failed:", err));

// // Serve static assets from 'public' folder (for style.css and script.js)
// app.use("/public", express.static(path.join(__dirname, "public")));

// // Serve static files from 'views' folder (for index.html and others)
// app.use(express.static(path.join(__dirname, "views")));

// // Serve index.html on root URL
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "views", "index.html"));
// });

// // Optional favicon handler to avoid 404s
// app.get("/favicon.ico", (req, res) => res.status(204).end());

// // Load API routes
// require("./api.js")(app);

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`App listening on port ${PORT}`));

// module.exports = app;
