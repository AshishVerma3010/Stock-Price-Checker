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

// Allow images from self and freeCodeCamp favicon CDN
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "https://cdn.freecodecamp.org"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  })
);

// Support JSON and URL encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.DB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Serve static assets from 'public' folder (for style.css and script.js)
app.use("/public", express.static(path.join(__dirname, "public")));

// Serve static files from 'views' folder (for index.html and others)
app.use(express.static(path.join(__dirname, "views")));

// Serve index.html on root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Optional favicon handler to avoid 404s
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Load API routes
require("./api.js")(app);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));

module.exports = app;
