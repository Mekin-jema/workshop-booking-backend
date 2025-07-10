const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes/index.routes");



const app = express();
// Rate limiting
app.use(express.json());

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:3001','https://workshop-booking-customer.vercel.app','https://workshop-booking-admin.vercel.app'], // your frontend origin
  credentials: true, // if you want to send cookies/auth headers
}));


app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use(routes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;