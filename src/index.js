const express = require("express");
const dotenv = require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require('path');
const app = express();
const cors = require('cors');
// const helmet = require('helmet');
const morgan = require("morgan");
const userRouter = require("./routes/user.routes.js");
const adminRouter = require("./routes/admin.routes.js");
const connectDB = require("./database/db");
connectDB();
app.use(express.json());
app.use(morgan("dev"));
const port = process.env.PORT || 3400;
// const httpsPort = process.env.HTTPSPORT || 3400;
app.use(cors());

// Use helmet middleware to set security headers
// app.use(helmet());

// You can also customize CORS options
app.use(cors({
  origin: 'http://localhost:6500/',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Serve static resources with caching headers
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.get("/", (req, res) => {
  res.send("WELCOME TO KURUNMI AUTOS LIMITED");
});

// Read SSL certificate and key files
// const options = {
//     key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
// };
// // Create HTTPS server
// const server = https.createServer(options, app);

app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}`);
});
// server.listen(httpsPort, () => {
//   console.log(`app listening on https://localhost:${httpsPort}`);
// });
