const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Congratulations! Your Server Running Perfectly",
  });
});

app.listen(port, () => {
  console.log(
    `Congratulations! 'Zehad Sarkar' portfolio server are running on port: ${port}`
  );
});

app.use("*", (req, res, next) => {
  res.status(404).json({
    success: "false",
    message: "This api not found",
  });
  next();
});
